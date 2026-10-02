// ============================================================================
// PRISON ENVIRONMENT — the authored corridor set (shell, cells, details).
// ----------------------------------------------------------------------------s
// Composition of the cinematic prison:
//   * shell: floor, ceiling, extruded walls with cell openings, entry hall
//   * CorridorDetails: structural layer (skirting, soffit, beams, pilasters,
//     conduit feeds, fixture housings, floor grate)
//   * CellBlock: all cells as four instanced draws
//   * instanced lamp capsules + instanced cell glow panels (instance-coloured
//     — they are the 3D reveal targets, so they light up individually
//     WITHOUT owning real lights)
//   * instanced fake floor pools + volumetric shafts riding the same reveal
//   * optional dust motes (tier dependent), clustered near the fixtures
//
// Everything static is baked once in useLayoutEffect; the only per-frame work
// is writing activation values into the instance-colour buffers.
// ============================================================================

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { IntroController } from "../intro/IntroController";
import type { QualitySettings } from "../performance/quality";
import { CorridorReveal } from "../reveal/CorridorReveal";
import { REVEAL, REVEAL_COLORS } from "../reveal/revealConfig";
import { CellBlock } from "./CellBlock";
import {
  createDustGeometry,
  createWallGeometry,
  getConeGeometry,
  getCellGlowGeometry,
  getLampGeometry,
  getPoolGeometry,
  getShell,
} from "./CorridorBuilder";
import { CorridorDetails } from "./CorridorDetails";
import { createCorridorLayout } from "./corridorMap";
import { prisonMaterials } from "./PrisonMaterials";
import { CORRIDOR } from "./prisonTypes";

interface PrisonEnvironmentProps {
  quality: QualitySettings;
  controller: IntroController;
}

const originQuat = new THREE.Quaternion();
const oneScale = new THREE.Vector3(1, 1, 1);

function translation(x: number, y: number, z: number): THREE.Matrix4 {
  return new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), originQuat, oneScale);
}

/** Colours written into instance buffers (3 floats each). */
const scratchColor = new THREE.Color();

export function PrisonEnvironment({ quality, controller }: PrisonEnvironmentProps) {
  const shadows = quality.shadows;

  const layout = useMemo(() => createCorridorLayout(quality.cellSpacing), [quality.cellSpacing]);
  const shell = useMemo(() => getShell(), []);
  const wallGeometries = useMemo(
    () => ({
      right: createWallGeometry(layout.cells, "right"),
      left: createWallGeometry(layout.cells, "left"),
    }),
    [layout],
  );
  const reveal = useMemo(() => new CorridorReveal(REVEAL, layout), [layout]);
  const dustGeometry = useMemo(
    () => (quality.dustCount > 0 ? createDustGeometry(quality.dustCount, layout.lamps) : null),
    [quality.dustCount, layout],
  );

  const glowRef = useRef<THREE.InstancedMesh>(null);
  const lampRef = useRef<THREE.InstancedMesh>(null);
  const poolRef = useRef<THREE.InstancedMesh>(null);
  const coneRef = useRef<THREE.InstancedMesh>(null);
  const dustRef = useRef<THREE.Points>(null);

  // Pool/cone transforms derive from the lamp positions (one fixture each).
  // MEDIUM/HIGH only — the cones are large transparent surfaces, so their
  // fill-rate cost is deliberately kept off the LOW (mobile) tier.
  const fixtureFx = useMemo(() => {
    const pools: THREE.Matrix4[] = [];
    const cones: THREE.Matrix4[] = [];
    if (quality.tier === "LOW") return { pools, cones };
    const quat = new THREE.Quaternion();
    const one = new THREE.Vector3(1, 1, 1);
    const poolScale = new THREE.Vector3(1.55, 1, 1.2);
    for (const lamp of layout.lamps) {
      const sign = lamp.x < 0 ? -1 : 1;
      pools.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3(lamp.x * 0.74, 0.014, lamp.z),
          quat,
          poolScale,
        ),
      );
      const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -sign * 0.14));
      cones.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3(lamp.x - sign * 0.15, 1.97, lamp.z),
          tilt,
          one,
        ),
      );
    }
    return { pools, cones };
  }, [layout, quality.tier]);

  // Bake static instance transforms + allocate colour buffers once.
  useLayoutEffect(() => {
    const glow = glowRef.current;
    if (glow) {
      for (let i = 0; i < layout.glows.length; i++) {
        const g = layout.glows[i]!;
        glow.setMatrixAt(i, translation(g.x, g.y, g.z));
        glow.setColorAt(i, scratchColor.setRGB(0, 0, 0));
      }
      glow.instanceMatrix.needsUpdate = true;
      if (glow.instanceColor) glow.instanceColor.needsUpdate = true;
      glow.computeBoundingSphere();
    }
    const lamp = lampRef.current;
    if (lamp) {
      for (let i = 0; i < layout.lamps.length; i++) {
        const l = layout.lamps[i]!;
        lamp.setMatrixAt(i, translation(l.x, l.y, l.z));
        lamp.setColorAt(i, scratchColor.setRGB(0, 0, 0));
      }
      lamp.instanceMatrix.needsUpdate = true;
      if (lamp.instanceColor) lamp.instanceColor.needsUpdate = true;
      lamp.computeBoundingSphere();
    }
    // Fake pools + volumetric shafts — one per fixture, dark until revealed.
    const pool = poolRef.current;
    if (pool) {
      for (let i = 0; i < fixtureFx.pools.length; i++) {
        pool.setMatrixAt(i, fixtureFx.pools[i]!);
        pool.setColorAt(i, scratchColor.setRGB(0, 0, 0));
      }
      pool.instanceMatrix.needsUpdate = true;
      if (pool.instanceColor) pool.instanceColor.needsUpdate = true;
      pool.computeBoundingSphere();
    }
    const cone = coneRef.current;
    if (cone) {
      for (let i = 0; i < fixtureFx.cones.length; i++) {
        cone.setMatrixAt(i, fixtureFx.cones[i]!);
        cone.setColorAt(i, scratchColor.setRGB(0, 0, 0));
      }
      cone.instanceMatrix.needsUpdate = true;
      if (cone.instanceColor) cone.instanceColor.needsUpdate = true;
      cone.computeBoundingSphere();
    }
  }, [layout, fixtureFx]);

  // The only animation work: distance-driven reveal → instance colours.
  useFrame((state) => {
    const time = controller.time;
    const dirty = reveal.update({
      cameraZ: state.camera.position.z,
      gate: controller.revealGate,
      time,
    });

    if (dirty) {
      const glow = glowRef.current;
      if (glow && glow.instanceColor) {
        const attr = glow.instanceColor;
        const [r, g, b] = REVEAL_COLORS.cellGlow;
        for (let i = 0; i < reveal.glowActivation.length; i++) {
          // Per-cell warmth keeps the block rhythm uneven (some cells darker).
          const v = reveal.glowActivation[i]! * layout.glows[i]!.warmth;
          attr.setXYZ(i, r * v, g * v, b * v);
        }
        attr.needsUpdate = true;
      }
      const lamp = lampRef.current;
      if (lamp && lamp.instanceColor) {
        const attr = lamp.instanceColor;
        const [r, g, b] = REVEAL_COLORS.lamp;
        for (let i = 0; i < reveal.lampActivation.length; i++) {
          const v = reveal.lampActivation[i]!;
          attr.setXYZ(i, r * v, g * v, b * v);
        }
        attr.needsUpdate = true;
      }
      // Pools and shafts wake up with their own fixture's activation.
      const pool = poolRef.current;
      if (pool && pool.instanceColor) {
        const attr = pool.instanceColor;
        const [r, g, b] = REVEAL_COLORS.lightPool;
        for (let i = 0; i < reveal.lampActivation.length; i++) {
          const v = reveal.lampActivation[i]!;
          attr.setXYZ(i, r * v, g * v, b * v);
        }
        attr.needsUpdate = true;
      }
      const cone = coneRef.current;
      if (cone && cone.instanceColor) {
        const attr = cone.instanceColor;
        const [r, g, b] = REVEAL_COLORS.lightCone;
        for (let i = 0; i < reveal.lampActivation.length; i++) {
          const v = reveal.lampActivation[i]!;
          attr.setXYZ(i, r * v, g * v, b * v);
        }
        attr.needsUpdate = true;
      }
    }

    // Dust fades in with the corridor and bobs very slowly (transform only).
    if (dustRef.current) {
      dustRef.current.position.y = Math.sin(time * 0.12) * 0.25;
      prisonMaterials.dust.opacity = 0.3 * controller.revealGate;
      dustRef.current.visible = controller.revealGate > 0.01;
    }
  });

  const { floor, wall, wallBox, ceiling, lampGlow, cellGlow, lightPool, lightCone, dust } =
    prisonMaterials;

  return (
    <group>
      {/* ── Shell ────────────────────────────────────────────────────────── */}
      <mesh
        material={floor}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, shell.floorZ]}
        receiveShadow={shadows}
      >
        <planeGeometry args={[5.8, shell.floorLength]} />
      </mesh>
      <mesh
        material={ceiling}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, CORRIDOR.height, shell.floorZ]}
      >
        <planeGeometry args={[5.8, shell.floorLength]} />
      </mesh>

      {/* Corridor walls (with punched cell openings) */}
      <mesh
        geometry={wallGeometries.right}
        material={wall}
        position={[CORRIDOR.wallHalfWidth + CORRIDOR.wallThickness, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow={shadows}
      />
      <mesh
        geometry={wallGeometries.left}
        material={wall}
        position={[-(CORRIDOR.wallHalfWidth + CORRIDOR.wallThickness), 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow={shadows}
      />

      {/* Entry-hall side walls (behind the gate) — box UVs need their own
          concrete tiling so the grain scale matches the corridor walls. */}
      {[-1, 1].map((sign) => (
        <mesh
          key={`hall-${sign}`}
          material={wallBox}
          position={[
            sign * (CORRIDOR.wallHalfWidth + CORRIDOR.wallThickness / 2),
            CORRIDOR.height / 2,
            shell.hallWallZ,
          ]}
          receiveShadow={shadows}
        >
          <boxGeometry args={[CORRIDOR.wallThickness, CORRIDOR.height, shell.hallWallLength]} />
        </mesh>
      ))}

      {/* Dead end (deep) + hall end (behind the camera) */}
      <mesh
        material={wallBox}
        position={[0, CORRIDOR.height / 2, CORRIDOR.zEnd - CORRIDOR.wallThickness / 2]}
        receiveShadow={shadows}
      >
        <boxGeometry args={[5.8, CORRIDOR.height, CORRIDOR.wallThickness]} />
      </mesh>
      <mesh
        material={wallBox}
        position={[0, CORRIDOR.height / 2, CORRIDOR.hallZEnd + CORRIDOR.wallThickness / 2]}
        receiveShadow={shadows}
      >
        <boxGeometry args={[5.8, CORRIDOR.height, CORRIDOR.wallThickness]} />
      </mesh>

      {/* ── Structural detail layer (beams, pilasters, conduit, housings) ─ */}
      <CorridorDetails lamps={layout.lamps} shadows={shadows} />

      {/* ── Cells (all instanced into four draws) ───────────────────────── */}
      <CellBlock cells={layout.cells} shadows={shadows} />

      {/* Cell glow panels — instanced, instance-coloured by the reveal */}
      <instancedMesh
        ref={glowRef}
        args={[getCellGlowGeometry(), cellGlow, layout.glows.length]}
        frustumCulled={false}
      />
      {/* Wall lamp capsules — instanced, instance-coloured by the reveal */}
      <instancedMesh
        ref={lampRef}
        args={[getLampGeometry(), lampGlow, layout.lamps.length]}
        frustumCulled={false}
      />
      {/* Fake floor pools under each fixture (additive, reveal-coloured;
          MEDIUM/HIGH only — same gating pattern as the dust motes) */}
      {fixtureFx.pools.length > 0 ? (
        <instancedMesh
          ref={poolRef}
          args={[getPoolGeometry(), lightPool, fixtureFx.pools.length]}
          frustumCulled={false}
        />
      ) : null}
      {/* Cheap volumetric shafts from each fixture (additive, MEDIUM/HIGH) */}
      {fixtureFx.cones.length > 0 ? (
        <instancedMesh
          ref={coneRef}
          args={[getConeGeometry(), lightCone, fixtureFx.cones.length]}
          frustumCulled={false}
        />
      ) : null}

      {/* ── Dust motes (MEDIUM/HIGH only) ────────────────────────────────── */}
      {dustGeometry ? <points ref={dustRef} geometry={dustGeometry} material={dust} /> : null}
    </group>
  );
}
