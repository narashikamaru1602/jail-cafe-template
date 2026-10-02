// ============================================================================
// CELL BLOCK — the repeating prison-cell module rendered with instancing.
// ----------------------------------------------------------------------------s
// Every cell on both walls is identical geometry, so the whole block renders
// as FOUR draw calls:
//   1. InstancedMesh of cell frames (extruded rectangle-with-hole)
//   2. InstancedMesh of that cell's bars (5 verticals + 2 cross ties each)
//   3. InstancedMesh of entrance hardware (lintel, threshold, hinges, latch)
//   4. InstancedMesh of bunk silhouettes (only in the cells that get one)
// Shared geometry from CorridorBuilder, shared material from PrisonMaterials.
// Frames/bars carry a subtle per-cell instance tint so the block never reads
// as one uniform grey. Matrices are baked once — nothing is rebuilt per frame.
// ============================================================================

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { CORRIDOR, type CellSlot } from "./prisonTypes";
import {
  getBunkGeometry,
  getCellBarGeometry,
  getCellFrameGeometry,
  getCellTrimGeometry,
} from "./CorridorBuilder";
import { prisonMaterials } from "./PrisonMaterials";

interface CellBlockProps {
  cells: readonly CellSlot[];
  shadows: boolean;
}

/** Bars baked in cell-local space (then multiplied by each cell's matrix). */
const BAR_LOCAL: readonly (readonly [number, number, number])[] = [
  [-0.6, 0, 0.06],
  [-0.3, 0, 0.06],
  [0, 0, 0.06],
  [0.3, 0, 0.06],
  [0.6, 0, 0.06],
];

const originQuat = new THREE.Quaternion();
const tieQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2));
const oneScale = new THREE.Vector3(1, 1, 1);
const tieScale = new THREE.Vector3(1, 1.72 / 2.26, 1);

function translation(x: number, y: number, z: number): THREE.Matrix4 {
  return new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), originQuat, oneScale);
}

/**
 * ~1/3 of the cells get a bunk silhouette so the interiors vary without
 * turning into prop clutter. Deterministic from the cell's index/side.
 */
function hasBunk(cell: CellSlot): boolean {
  const n = cell.index * 2 + (cell.side === "left" ? 1 : 0);
  return n % 5 === 1;
}

/** Deterministic per-cell tone (0.93..1.05) for frames and bars. */
function cellTint(cell: CellSlot): number {
  const n = cell.index * 5 + (cell.side === "left" ? 3 : 0);
  return 0.93 + (n % 8) * 0.015;
}

const scratchColor = new THREE.Color();

export function CellBlock({ cells, shadows }: CellBlockProps) {
  const framesRef = useRef<THREE.InstancedMesh>(null);
  const barsRef = useRef<THREE.InstancedMesh>(null);
  const trimRef = useRef<THREE.InstancedMesh>(null);
  const bunkRef = useRef<THREE.InstancedMesh>(null);
  const frameGeometry = getCellFrameGeometry();
  const barGeometry = getCellBarGeometry();
  const trimGeometry = getCellTrimGeometry();
  const bunkGeometry = getBunkGeometry();

  const { frameMatrices, barMatrices, trimMatrices, bunkMatrices, tints } = useMemo(() => {
    const frames: THREE.Matrix4[] = [];
    const bars: THREE.Matrix4[] = [];
    const trims: THREE.Matrix4[] = [];
    const bunks: THREE.Matrix4[] = [];
    const tones: number[] = [];
    const wallX = CORRIDOR.wallHalfWidth + CORRIDOR.frameProtrusion;

    for (const cell of cells) {
      const isRight = cell.side === "right";
      const rotation = isRight ? -Math.PI / 2 : Math.PI / 2;
      const cellMatrix = new THREE.Matrix4().compose(
        new THREE.Vector3(isRight ? wallX : -wallX, CORRIDOR.cellCenterY, cell.z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotation, 0)),
        oneScale,
      );
      frames.push(cellMatrix.clone());
      tones.push(cellTint(cell));

      for (const [x, y, z] of BAR_LOCAL) {
        bars.push(cellMatrix.clone().multiply(translation(x, y, z)));
      }
      // Horizontal cross ties (cylinder re-oriented + shortened via scale).
      for (const y of [0.78, -0.78]) {
        bars.push(
          cellMatrix
            .clone()
            .multiply(
              new THREE.Matrix4().compose(new THREE.Vector3(0, y, 0.06), tieQuat, tieScale),
            ),
        );
      }

      // Entrance hardware (lintel/threshold/hinges/latch) — same cell matrix.
      trims.push(cellMatrix.clone());

      // Bunk silhouette inside the wall pocket, with a touch of jitter so
      // no two bunks sit at the exact same angle.
      if (hasBunk(cell)) {
        const jitter = (cell.index % 3) * 0.03 - 0.03;
        const bunkMatrix = cellMatrix
          .clone()
          .multiply(
            new THREE.Matrix4().compose(
              new THREE.Vector3(0, 0, jitter),
              new THREE.Quaternion().setFromEuler(new THREE.Euler(0, jitter * 1.5, 0)),
              oneScale,
            ),
          );
        bunks.push(bunkMatrix);
      }
    }
    return {
      frameMatrices: frames,
      barMatrices: bars,
      trimMatrices: trims,
      bunkMatrices: bunks,
      tints: tones,
    };
  }, [cells]);

  useLayoutEffect(() => {
    const frames = framesRef.current;
    if (frames) {
      for (let i = 0; i < frameMatrices.length; i++) {
        frames.setMatrixAt(i, frameMatrices[i]!);
        frames.setColorAt(i, scratchColor.setScalar(tints[Math.floor(i)] ?? 1));
      }
      frames.instanceMatrix.needsUpdate = true;
      if (frames.instanceColor) frames.instanceColor.needsUpdate = true;
      frames.computeBoundingSphere();
    }
    const bars = barsRef.current;
    if (bars) {
      // 7 bar instances per cell (5 verticals + 2 ties) share the cell tint.
      for (let i = 0; i < barMatrices.length; i++) {
        bars.setMatrixAt(i, barMatrices[i]!);
        bars.setColorAt(i, scratchColor.setScalar(tints[Math.floor(i / 7)] ?? 1));
      }
      bars.instanceMatrix.needsUpdate = true;
      if (bars.instanceColor) bars.instanceColor.needsUpdate = true;
      bars.computeBoundingSphere();
    }
    const trim = trimRef.current;
    if (trim) {
      for (let i = 0; i < trimMatrices.length; i++) {
        trim.setMatrixAt(i, trimMatrices[i]!);
      }
      trim.instanceMatrix.needsUpdate = true;
      trim.computeBoundingSphere();
    }
    const bunk = bunkRef.current;
    if (bunk) {
      for (let i = 0; i < bunkMatrices.length; i++) {
        bunk.setMatrixAt(i, bunkMatrices[i]!);
      }
      bunk.instanceMatrix.needsUpdate = true;
      bunk.computeBoundingSphere();
    }
  }, [frameMatrices, barMatrices, trimMatrices, bunkMatrices, tints]);

  if (cells.length === 0) return null;

  return (
    <group>
      <instancedMesh
        ref={framesRef}
        args={[frameGeometry, prisonMaterials.metalDark, frameMatrices.length]}
        castShadow={shadows}
        receiveShadow={shadows}
        frustumCulled={false}
      />
      <instancedMesh
        ref={barsRef}
        args={[barGeometry, prisonMaterials.metalDark, barMatrices.length]}
        castShadow={shadows}
        frustumCulled={false}
      />
      {/* Entrance hardware — machined metal, catches the lamp pools. */}
      <instancedMesh
        ref={trimRef}
        args={[trimGeometry, prisonMaterials.metalFrame, trimMatrices.length]}
        castShadow={shadows}
        frustumCulled={false}
      />
      {/* Bunk silhouettes — near-black shapes against the glow panels. */}
      {bunkMatrices.length > 0 ? (
        <instancedMesh
          ref={bunkRef}
          args={[bunkGeometry, prisonMaterials.voidDark, bunkMatrices.length]}
          frustumCulled={false}
        />
      ) : null}
    </group>
  );
}
