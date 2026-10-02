// ============================================================================
// JAIL GATE — double-leaf prison gate: frame, hinges, bars, rivets, lock.
// ----------------------------------------------------------------------------s
// Structure (as specified by the architecture contract):
//
//   GateFrame (header, jambs, wings, brass trim, anchor bolts, stop lip)
//    ├── LeftHinge  ── (pivot on the outer edge, rotation.y = +open)
//    │     └── LeftLeaf  (frame, bars, straps, rivets, lock plate + escutcheon,
//    │                    bolt, key knob)
//    └── RightHinge ── (pivot on the outer edge, rotation.y = -open)
//          └── RightLeaf (mirrored frame, bars, straps, rivets, socket, handle)
//
//  * Pivots are derived from bounding boxes via gate/hinge.ts, so swapping
//    the procedural leaves for a GLB later keeps the same rotation origin.
//  * Rivets and bars are InstancedMesh (one draw call each per leaf).
//  * One shared material set from PrisonMaterials — no per-mesh clones.
//  * Pose comes from the pure getGatePose(time) — one clock, zero GSAP.
// ============================================================================

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { IntroController } from "../intro/IntroController";
import { CORRIDOR } from "../prison/prisonTypes";
import { prisonMaterials } from "../prison/PrisonMaterials";
import { getGatePose } from "./gateAnimation";
import { GATE_DIMENSIONS, type GatePhase } from "./gateTypes";
import { createHingeSetup } from "./hinge";

interface JailGateProps {
  controller: IntroController;
  /** Whether the gate may cast/receive shadows (quality tier). */
  shadows: boolean;
}

// ── Shared geometry (module singletons, one instance per shape) ─────────────
const barGeo = new THREE.CylinderGeometry(0.033, 0.033, 2.68, 8);
const rivetGeo = new THREE.SphereGeometry(0.03, 8, 6);
const knuckleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.34, 10);
/** Thin bolted plate tying each leaf to its hinge line (front face). */
const strapGeo = new THREE.BoxGeometry(0.36, 0.08, 0.02);
/** Brass key escutcheon disc on the lock side (faces the camera). */
const escutcheonGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.016, 16);
escutcheonGeo.rotateX(Math.PI / 2);

const originQuat = new THREE.Quaternion();
const oneScale = new THREE.Vector3(1, 1, 1);

function translation(x: number, y: number, z: number): THREE.Matrix4 {
  return new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), originQuat, oneScale);
}

/** Bakes static matrices into an InstancedMesh once the node exists. */
function useStaticInstances(
  ref: RefObject<THREE.InstancedMesh | null>,
  matrices: readonly THREE.Matrix4[],
): void {
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    for (let i = 0; i < matrices.length; i++) {
      mesh.setMatrixAt(i, matrices[i]!);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [ref, matrices]);
}

// ── Leaf layout (authored in GATE space; opening spans y 0..3.0) ────────────
const LEAF = {
  height: 2.96,
  depth: GATE_DIMENSIONS.leafDepth,
  halfOpen: GATE_DIMENSIONS.openingWidth / 2, // 1.7 — the hinge line
  innerEdge: GATE_DIMENSIONS.leafGap / 2, // 0.02 — meeting gap
  centerY: 1.5,
  /** Mirrored distances from the centre line (always positive). */
  outerStile: 1.65,
  innerStile: 0.07,
  railCenter: 0.86,
  railWidth: 1.68,
  railTop: 2.91,
  railBottom: 0.09,
  midRail: 1.5,
  barX: [0.33, 0.61, 0.89, 1.17, 1.45],
  lockY: 1.42,
} as const;

interface LeafSideProps {
  side: "left" | "right";
  pivot: THREE.Vector3;
  contentOffset: THREE.Vector3;
  shadows: boolean;
  /** Hinge rotation for this leaf (radians). */
  angleRef: RefObject<THREE.Group | null>;
  /** Bolt group — only the left leaf has a bolt (null on the right). */
  boltRef: RefObject<THREE.Group | null> | null;
  /** Key knob group — only the left leaf has one (null on the right). */
  knobRef: RefObject<THREE.Group | null> | null;
}

function GateLeaf({
  side,
  pivot,
  contentOffset,
  shadows,
  angleRef,
  boltRef,
  knobRef,
}: LeafSideProps) {
  const barsRef = useRef<THREE.InstancedMesh>(null);
  const rivetsRef = useRef<THREE.InstancedMesh>(null);
  const strapsRef = useRef<THREE.InstancedMesh>(null);

  const isLeft = side === "left";
  const m = isLeft ? -1 : 1;

  // Instanced bar/rivet transforms, baked once (static relative to the leaf).
  const barMatrices = useMemo(() => LEAF.barX.map((x) => translation(m * x, LEAF.midRail, 0)), [m]);
  // Hinge straps sit proud of the leaf face at the three knuckle heights.
  const strapMatrices = useMemo(
    () => [0.5, 1.5, 2.5].map((y) => translation(m * 1.48, y, 0.056)),
    [m],
  );
  const rivetMatrices = useMemo(() => {
    const out: THREE.Matrix4[] = [];
    const z = LEAF.depth / 2;
    for (const y of [LEAF.railTop, LEAF.railBottom]) {
      for (let i = 0; i < 6; i++) {
        out.push(translation(m * (0.2 + i * 0.26), y, z));
      }
    }
    for (const x of [LEAF.outerStile, LEAF.innerStile]) {
      for (let i = 0; i < 4; i++) {
        out.push(translation(m * x, LEAF.centerY - 1.05 + i * 0.7, z));
      }
    }
    // Two bolt heads per hinge strap (on the strap face, proud of the leaf).
    for (const y of [0.5, 1.5, 2.5]) {
      out.push(translation(m * 1.37, y, 0.078));
      out.push(translation(m * 1.57, y, 0.078));
    }
    return out;
  }, [m]);

  useStaticInstances(barsRef, barMatrices);
  useStaticInstances(rivetsRef, rivetMatrices);
  useStaticInstances(strapsRef, strapMatrices);

  const { metalDark, metalFrame, brass } = prisonMaterials;

  return (
    <group ref={angleRef} position={pivot}>
      {/* Content authored in gate space → offset back so it keeps its place. */}
      <group position={contentOffset}>
        {/* Stiles */}
        <mesh
          material={metalFrame}
          position={[m * LEAF.outerStile, LEAF.centerY, 0]}
          castShadow={shadows}
          receiveShadow={shadows}
        >
          <boxGeometry args={[0.1, LEAF.height, LEAF.depth]} />
        </mesh>
        <mesh
          material={metalFrame}
          position={[m * LEAF.innerStile, LEAF.centerY, 0]}
          castShadow={shadows}
          receiveShadow={shadows}
        >
          <boxGeometry args={[0.1, LEAF.height, LEAF.depth]} />
        </mesh>

        {/* Rails */}
        <mesh
          material={metalDark}
          position={[m * LEAF.railCenter, LEAF.railTop, 0]}
          castShadow={shadows}
        >
          <boxGeometry args={[LEAF.railWidth, 0.14, LEAF.depth]} />
        </mesh>
        <mesh
          material={metalDark}
          position={[m * LEAF.railCenter, LEAF.railBottom, 0]}
          castShadow={shadows}
        >
          <boxGeometry args={[LEAF.railWidth, 0.14, LEAF.depth]} />
        </mesh>
        <mesh
          material={metalDark}
          position={[m * LEAF.railCenter, LEAF.midRail, 0]}
          castShadow={shadows}
        >
          <boxGeometry args={[LEAF.railWidth, 0.1, LEAF.depth]} />
        </mesh>

        {/* Bars — 5 verticals, one instanced draw call */}
        <instancedMesh
          ref={barsRef}
          args={[barGeo, metalDark, barMatrices.length]}
          castShadow={shadows}
        />

        {/* Rivets — border + strap bolts, one instanced draw call */}
        <instancedMesh ref={rivetsRef} args={[rivetGeo, metalDark, rivetMatrices.length]} />

        {/* Hinge straps — three bolted plates tying leaf to knuckle line */}
        <instancedMesh
          ref={strapsRef}
          args={[strapGeo, metalFrame, strapMatrices.length]}
          castShadow={shadows}
        />

        {isLeft ? (
          <>
            {/* Lock housing */}
            <mesh
              material={metalFrame}
              position={[m * LEAF.innerStile, LEAF.lockY, 0]}
              castShadow={shadows}
            >
              <boxGeometry args={[0.16, 0.36, 0.16]} />
            </mesh>
            {/* Brass escutcheon disc + dark keyway under the knob */}
            <mesh
              material={brass}
              geometry={escutcheonGeo}
              position={[m * LEAF.innerStile, LEAF.lockY, 0.098]}
              castShadow={shadows}
            />
            <mesh
              material={metalDark}
              position={[m * (LEAF.innerStile + 0.04), LEAF.lockY - 0.045, 0.106]}
            >
              <boxGeometry args={[0.018, 0.045, 0.01]} />
            </mesh>
            {/* Bolt — slides toward the right leaf's socket */}
            <group ref={boltRef}>
              <mesh
                material={brass}
                position={[LEAF.innerStile + 0.15, LEAF.lockY, 0]}
                castShadow={shadows}
              >
                <boxGeometry args={[0.3, 0.08, 0.08]} />
              </mesh>
            </group>
            {/* Key knob — turns before the bolt retracts */}
            <group ref={knobRef} position={[m * LEAF.innerStile, LEAF.lockY, 0.11]}>
              <mesh material={brass} castShadow={shadows}>
                <boxGeometry args={[0.05, 0.16, 0.04]} />
              </mesh>
            </group>
          </>
        ) : (
          <>
            {/* Socket plate the bolt lands in */}
            <mesh
              material={metalFrame}
              position={[m * LEAF.innerStile, LEAF.lockY, 0]}
              castShadow={shadows}
            >
              <boxGeometry args={[0.16, 0.36, 0.16]} />
            </mesh>
            {/* Fixed grab handle */}
            <mesh
              material={brass}
              position={[m * LEAF.innerStile, LEAF.lockY - 0.45, 0.09]}
              castShadow={shadows}
            >
              <boxGeometry args={[0.05, 0.3, 0.05]} />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}

export function JailGate({ controller, shadows }: JailGateProps) {
  const leftAngleRef = useRef<THREE.Group>(null);
  const rightAngleRef = useRef<THREE.Group>(null);
  const boltRef = useRef<THREE.Group>(null);
  const knobRef = useRef<THREE.Group>(null);
  const lastPhase = useRef<GatePhase>("locked");

  // Pivots derived from bounding boxes (reimplemented doorPivotSetup
  // mechanism) — the same math a GLB leaf would need.
  const { leftPivot, leftOffset, rightPivot, rightOffset } = useMemo(() => {
    const d = LEAF.depth / 2;
    const yMin = LEAF.centerY - LEAF.height / 2;
    const yMax = LEAF.centerY + LEAF.height / 2;
    const left = createHingeSetup(
      new THREE.Box3(
        new THREE.Vector3(-LEAF.halfOpen, yMin, -d),
        new THREE.Vector3(-LEAF.innerEdge, yMax, d),
      ),
      "left",
    );
    const right = createHingeSetup(
      new THREE.Box3(
        new THREE.Vector3(LEAF.innerEdge, yMin, -d),
        new THREE.Vector3(LEAF.halfOpen, yMax, d),
      ),
      "right",
    );
    return {
      leftPivot: left.pivot,
      leftOffset: left.contentOffset,
      rightPivot: right.pivot,
      rightOffset: right.contentOffset,
    };
  }, []);

  const schedule = controller.gateSchedule;

  // Facade anchor bolts (jamb corners + header line), baked once.
  const frameRivetsRef = useRef<THREE.InstancedMesh>(null);
  const frameRivetMatrices = useMemo(() => {
    const d = GATE_DIMENSIONS;
    const jx = d.openingWidth / 2 + d.frameThickness / 2;
    const z = d.frameDepth / 2 + 0.005;
    const headerY = d.openingHeight + (d.corridorHeight - d.openingHeight) / 2;
    const out: THREE.Matrix4[] = [];
    for (const sign of [-1, 1]) {
      for (const y of [0.35, 1.5, 2.65]) out.push(translation(sign * jx, y, z));
    }
    for (const x of [-2.2, -1.0, 1.0, 2.2]) out.push(translation(x, headerY, z));
    return out;
  }, []);
  useStaticInstances(frameRivetsRef, frameRivetMatrices);

  useFrame(() => {
    // Pure function of the ONE shared clock — no GSAP, no state per frame.
    const pose = getGatePose(controller.time, schedule);

    if (leftAngleRef.current) leftAngleRef.current.rotation.y = pose.leftAngle;
    if (rightAngleRef.current) rightAngleRef.current.rotation.y = pose.rightAngle;
    if (boltRef.current) boltRef.current.position.x = pose.boltOffset;
    if (knobRef.current) knobRef.current.rotation.z = pose.knobAngle;

    // Discrete phase transitions → events (never per-frame React state).
    if (pose.phase !== lastPhase.current) {
      lastPhase.current = pose.phase;
      if (pose.phase === "unlocking") controller.emit({ type: "gate", name: "unlock" });
      if (pose.phase === "opening") controller.emit({ type: "gate", name: "open" });
    }
  });

  const { metalDark, metalFrame, brass } = prisonMaterials;
  const open = GATE_DIMENSIONS;
  const jambX = open.openingWidth / 2 + open.frameThickness / 2;
  const wingWidth = open.wallHalfWidth - (open.openingWidth / 2 + open.frameThickness);
  const headerHeight = open.corridorHeight - open.openingHeight;
  const knuckleYs = [0.5, 1.5, 2.5];

  return (
    <group>
      {/* ── Static frame ─────────────────────────────────────────────────── */}
      <mesh
        material={metalFrame}
        position={[0, open.openingHeight + headerHeight / 2, 0]}
        castShadow={shadows}
        receiveShadow={shadows}
      >
        <boxGeometry args={[open.wallHalfWidth * 2, headerHeight, open.frameDepth]} />
      </mesh>

      {[-1, 1].map((sign) => (
        <mesh
          key={`jamb-${sign}`}
          material={metalFrame}
          position={[sign * jambX, open.openingHeight / 2, 0]}
          castShadow={shadows}
          receiveShadow={shadows}
        >
          <boxGeometry args={[open.frameThickness, open.openingHeight, open.frameDepth]} />
        </mesh>
      ))}

      {/* Facade wings: jamb → corridor wall */}
      {[-1, 1].map((sign) => (
        <mesh
          key={`wing-${sign}`}
          material={metalFrame}
          position={[
            sign * (open.openingWidth / 2 + open.frameThickness + wingWidth / 2),
            open.corridorHeight / 2,
            0,
          ]}
          receiveShadow={shadows}
        >
          <boxGeometry args={[wingWidth, open.corridorHeight, open.frameDepth]} />
        </mesh>
      ))}

      {/* Brass trim along the inner opening edge (original skeleton's
          premium detail language, preserved) */}
      <mesh material={brass} position={[0, open.openingHeight - 0.03, open.frameDepth / 2 + 0.02]}>
        <boxGeometry args={[open.openingWidth, 0.05, 0.06]} />
      </mesh>
      {[-1, 1].map((sign) => (
        <mesh
          key={`trim-${sign}`}
          material={brass}
          position={[
            sign * (open.openingWidth / 2 - 0.03),
            open.openingHeight / 2,
            open.frameDepth / 2 + 0.02,
          ]}
        >
          <boxGeometry args={[0.05, open.openingHeight, 0.06]} />
        </mesh>
      ))}

      {/* Hinge knuckles (static, on the frame) */}
      {[-1, 1].map((sign) =>
        knuckleYs.map((y) => (
          <mesh
            key={`knuckle-${sign}-${y}`}
            geometry={knuckleGeo}
            material={metalFrame}
            position={[(sign * open.openingWidth) / 2, y, 0.06]}
            castShadow={shadows}
          />
        )),
      )}

      {/* Anchor bolts through the facade frame (jamb + header) */}
      <instancedMesh ref={frameRivetsRef} args={[rivetGeo, metalDark, frameRivetMatrices.length]} />

      {/* Stop lip hanging from the header — the leaves rest 5 mm below it */}
      <mesh
        material={metalDark}
        position={[0, open.openingHeight + 0.01, 0.02]}
        castShadow={shadows}
      >
        <boxGeometry args={[open.openingWidth - 0.08, 0.05, 0.1]} />
      </mesh>

      {/* ── Leaves ───────────────────────────────────────────────────────── */}
      <GateLeaf
        side="left"
        pivot={leftPivot}
        contentOffset={leftOffset}
        shadows={shadows}
        angleRef={leftAngleRef}
        boltRef={boltRef}
        knobRef={knobRef}
      />
      <GateLeaf
        side="right"
        pivot={rightPivot}
        contentOffset={rightOffset}
        shadows={shadows}
        angleRef={rightAngleRef}
        boltRef={null}
        knobRef={null}
      />

      {/* Threshold strip at the gate plane */}
      <mesh material={metalFrame} position={[0, 0.01, 0]} receiveShadow={shadows}>
        <boxGeometry args={[CORRIDOR.wallHalfWidth * 2, 0.02, open.frameDepth]} />
      </mesh>
    </group>
  );
}
