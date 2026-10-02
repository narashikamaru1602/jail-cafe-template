// ============================================================================
// CORRIDOR DETAILS — the structural layer of the set (Phase 3).
// ----------------------------------------------------------------------------s
// Static architecture that makes the corridor read as built rather than as
// a box with holes in it:
//   * skirting + ceiling soffit runs (trim where surfaces meet)
//   * ceiling cross-beams aligned with the pilaster rhythm
//   * pilasters between the cell bays (shaft + base + capital, one draw)
//   * conduit runs with junction feeds into every fixture
//   * a floor grate in the entry hall (the camera's foreground)
// Everything is instanced or shared: ~12 draw calls total, no per-frame
// work, matrices baked once.
// ============================================================================

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  getBeamGeometry,
  getFeedGeometry,
  getLampHousingGeometry,
  getPilasterGeometry,
} from "./CorridorBuilder";
import { prisonMaterials } from "./PrisonMaterials";
import { CORRIDOR, type LampSlot } from "./prisonTypes";

interface CorridorDetailsProps {
  lamps: readonly LampSlot[];
  shadows: boolean;
}

const originQuat = new THREE.Quaternion();
const oneScale = new THREE.Vector3(1, 1, 1);

function translation(x: number, y: number, z: number): THREE.Matrix4 {
  return new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), originQuat, oneScale);
}

/** Ceiling beams: one in the hall + one at each pilaster bay. */
const BEAM_Z: readonly number[] = (() => {
  const out = [2.6];
  for (let z = -2; z >= -42; z -= 4) out.push(z);
  return out;
})();

/** Pilasters stand between the cell bays (cells live at -4, -8, …). */
const PILASTER_Z: readonly number[] = (() => {
  const out: number[] = [];
  for (let z = -2; z >= -42; z -= 4) out.push(z);
  return out;
})();

/** Facade depth: conduit is segmented so it never runs through the gate wall. */
const FACADE_HALF = 0.175;
const CONDUIT_X = 2.26;
const CONDUIT_Y = 2.62;
const CONDUIT_RADIUS = 0.035;

export function CorridorDetails({ lamps, shadows }: CorridorDetailsProps) {
  const beamsRef = useRef<THREE.InstancedMesh>(null);
  const pilastersRef = useRef<THREE.InstancedMesh>(null);
  const feedsRef = useRef<THREE.InstancedMesh>(null);
  const housingsRef = useRef<THREE.InstancedMesh>(null);

  // Conduit segments (hall + corridor per side), built once.
  const conduit = useMemo(() => {
    const corridorLength = -FACADE_HALF - CORRIDOR.zEnd + 0.6; // to just past the dead end
    const corridorCenter = (-FACADE_HALF + (CORRIDOR.zEnd - 0.6)) / 2;
    const hallLength = CORRIDOR.hallZEnd - FACADE_HALF - 0.1;
    const hallCenter = (FACADE_HALF + 0.1 + CORRIDOR.hallZEnd) / 2;
    return {
      corridorLength,
      corridorCenter,
      hallLength,
      hallCenter,
      geometry: (() => {
        const g = new THREE.CylinderGeometry(CONDUIT_RADIUS, CONDUIT_RADIUS, corridorLength, 8);
        g.rotateX(Math.PI / 2);
        return g;
      })(),
      hallGeometry: (() => {
        const g = new THREE.CylinderGeometry(CONDUIT_RADIUS, CONDUIT_RADIUS, hallLength, 8);
        g.rotateX(Math.PI / 2);
        return g;
      })(),
    };
  }, []);

  const skirting = useMemo(() => {
    const fullLength = CORRIDOR.hallZEnd - (CORRIDOR.zEnd - CORRIDOR.wallThickness);
    const fullCenter = (CORRIDOR.hallZEnd + (CORRIDOR.zEnd - CORRIDOR.wallThickness)) / 2;
    return { fullLength, fullCenter };
  }, []);

  const drain = useMemo(() => {
    const slots = [0, 1, 2].map((i) => {
      const g = new THREE.BoxGeometry(0.2, 0.008, 0.03);
      g.translate(0, 0.014, -0.06 + i * 0.06);
      return g;
    });
    const slotMesh = mergeGeometries(slots)!;
    slots.forEach((g) => g.dispose());
    return { slots: slotMesh };
  }, []);

  const beamMatrices = useMemo(
    () => BEAM_Z.map((z) => translation(0, CORRIDOR.height - 0.08, z)),
    [],
  );

  const pilasterMatrices = useMemo(() => {
    const out: THREE.Matrix4[] = [];
    for (const z of PILASTER_Z) {
      out.push(translation(CONDUIT_X + 0.09, 0, z));
      out.push(translation(-(CONDUIT_X + 0.09), 0, z));
    }
    return out;
  }, []);

  // Fixture feeds + housings share the lamp transform (rotated for the left).
  const lampMatrices = useMemo(() => {
    const quat = new THREE.Quaternion();
    const rotLeft = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0));
    return lamps.map((lamp) =>
      new THREE.Matrix4().compose(
        new THREE.Vector3(lamp.x, lamp.y, lamp.z),
        lamp.x < 0 ? rotLeft : quat,
        oneScale,
      ),
    );
  }, [lamps]);

  useLayoutEffect(() => {
    const bake = (mesh: THREE.InstancedMesh | null, matrices: readonly THREE.Matrix4[]) => {
      if (!mesh) return;
      for (let i = 0; i < matrices.length; i++) mesh.setMatrixAt(i, matrices[i]!);
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    };
    bake(beamsRef.current, beamMatrices);
    bake(pilastersRef.current, pilasterMatrices);
    bake(feedsRef.current, lampMatrices);
    bake(housingsRef.current, lampMatrices);
  }, [beamMatrices, pilasterMatrices, lampMatrices]);

  return (
    <group>
      {/* ── Trim runs (skirting + soffit), proud of the wall so the gate
          facade crossing never z-fights. */}
      {[-1, 1].map((sign) => (
        <mesh
          key={`skirt-${sign}`}
          material={prisonMaterials.metalDark}
          position={[sign * 2.38, 0.08, skirting.fullCenter]}
          receiveShadow={shadows}
        >
          <boxGeometry args={[0.05, 0.16, skirting.fullLength]} />
        </mesh>
      ))}
      {[-1, 1].map((sign) => (
        <mesh
          key={`soffit-${sign}`}
          material={prisonMaterials.wallBox}
          position={[sign * 2.375, 3.345, skirting.fullCenter]}
          receiveShadow={shadows}
        >
          <boxGeometry args={[0.06, 0.1, skirting.fullLength]} />
        </mesh>
      ))}

      {/* ── Conduit runs (corridor + hall segments per side). */}
      {[-1, 1].map((sign) => (
        <group key={`conduit-${sign}`}>
          <mesh
            material={prisonMaterials.metalFrame}
            geometry={conduit.geometry}
            position={[sign * CONDUIT_X, CONDUIT_Y, conduit.corridorCenter]}
          />
          <mesh
            material={prisonMaterials.metalFrame}
            geometry={conduit.hallGeometry}
            position={[sign * CONDUIT_X, CONDUIT_Y, conduit.hallCenter]}
          />
        </group>
      ))}

      {/* ── Entry-hall floor grate (foreground detail at the camera start). */}
      <mesh
        material={prisonMaterials.voidDark}
        position={[1.7, 0.005, 4.6]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow={shadows}
      >
        <circleGeometry args={[0.15, 20]} />
      </mesh>
      <mesh material={prisonMaterials.metalFrame} geometry={drain.slots} position={[1.7, 0, 4.6]} />

      {/* ── Instanced structure ─────────────────────────────────────────── */}
      <instancedMesh
        ref={beamsRef}
        args={[getBeamGeometry(), prisonMaterials.metalDark, beamMatrices.length]}
        castShadow={shadows}
        receiveShadow={shadows}
        frustumCulled={false}
      />
      <instancedMesh
        ref={pilastersRef}
        args={[getPilasterGeometry(), prisonMaterials.wallBox, pilasterMatrices.length]}
        castShadow={shadows}
        receiveShadow={shadows}
        frustumCulled={false}
      />
      {/* Junction feed (box + riser) at every fixture. */}
      <instancedMesh
        ref={feedsRef}
        args={[getFeedGeometry(), prisonMaterials.metalFrame, lampMatrices.length]}
        frustumCulled={false}
      />
      {/* Fixture housings (canopy + arm). */}
      <instancedMesh
        ref={housingsRef}
        args={[getLampHousingGeometry(), prisonMaterials.metalFrame, lampMatrices.length]}
        castShadow={shadows}
        frustumCulled={false}
      />
    </group>
  );
}
