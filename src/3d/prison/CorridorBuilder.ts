// ============================================================================
// CORRIDOR BUILDER — geometry factories for the authored prison set.
// ----------------------------------------------------------------------------s
// All geometries are created ONCE (module singletons or useMemo) and shared
// by every instance that needs them. Nothing here runs per frame and nothing
// here is ever re-created during the animation — we only ever move, scale or
// recolour what already exists.
//
// Technique: walls with cell openings are a single ExtrudeGeometry whose
// Shape carries rectangular holes (one draw call per wall, proper reveals
// around every cell opening).
// ============================================================================

import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { CORRIDOR, type CellSide, type CellSlot } from "./prisonTypes";

/** Opening punched through the wall for each cell. */
const HOLE_HALF_W = CORRIDOR.cellOpeningWidth / 2; // 0.85
const HOLE_BOTTOM = CORRIDOR.cellCenterY - CORRIDOR.cellOpeningHeight / 2; // 0.15
const HOLE_TOP = CORRIDOR.cellCenterY + CORRIDOR.cellOpeningHeight / 2; // 2.45

/**
 * One wall (from the gate plane to the dead end) with a hole per cell.
 * `side` decides the sign convention so both walls can reuse this builder.
 */
export function createWallGeometry(
  cells: readonly CellSlot[],
  side: CellSide,
): THREE.ExtrudeGeometry {
  // Shape-space x maps to world z (mirrored on the left wall so the extrusion
  // still runs from the outer face toward the corridor interior).
  const flip = side === "left";
  const x0 = flip ? 0 : CORRIDOR.zEnd; // 0 | -45
  const x1 = flip ? -CORRIDOR.zEnd : 0; // 45 | 0

  const shape = new THREE.Shape();
  shape.moveTo(x0, 0);
  shape.lineTo(x1, 0);
  shape.lineTo(x1, CORRIDOR.height);
  shape.lineTo(x0, CORRIDOR.height);
  shape.closePath();

  for (const cell of cells) {
    if (cell.side !== side) continue;
    const cx = flip ? -cell.z : cell.z;
    const hole = new THREE.Path();
    hole.moveTo(cx - HOLE_HALF_W, HOLE_BOTTOM);
    hole.lineTo(cx + HOLE_HALF_W, HOLE_BOTTOM);
    hole.lineTo(cx + HOLE_HALF_W, HOLE_TOP);
    hole.lineTo(cx - HOLE_HALF_W, HOLE_TOP);
    hole.closePath();
    shape.holes.push(hole);
  }

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: CORRIDOR.wallThickness,
    bevelEnabled: false,
    curveSegments: 1,
  });
  geometry.computeVertexNormals();
  return geometry;
}

/** Cell frame: a rectangle with a rectangular hole (the doorway reveal). */
let cellFrameGeometry: THREE.ExtrudeGeometry | null = null;
export function getCellFrameGeometry(): THREE.ExtrudeGeometry {
  if (cellFrameGeometry) return cellFrameGeometry;
  const shape = new THREE.Shape();
  const hw = CORRIDOR.cellFrameWidth / 2;
  const hh = CORRIDOR.cellFrameHeight / 2;
  shape.moveTo(-hw, -hh);
  shape.lineTo(hw, -hh);
  shape.lineTo(hw, hh);
  shape.lineTo(-hw, hh);
  shape.closePath();

  const holeHalfH = CORRIDOR.cellOpeningHeight / 2;
  const hole = new THREE.Path();
  hole.moveTo(-HOLE_HALF_W, -holeHalfH);
  hole.lineTo(HOLE_HALF_W, -holeHalfH);
  hole.lineTo(HOLE_HALF_W, holeHalfH);
  hole.lineTo(-HOLE_HALF_W, holeHalfH);
  hole.closePath();
  shape.holes.push(hole);

  cellFrameGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.18, // frame stands 0.18 m proud, overlapping the wall face
    bevelEnabled: false,
    curveSegments: 1,
  });
  cellFrameGeometry.computeVertexNormals();
  return cellFrameGeometry;
}

/** Vertical cell bars (instanced per cell). */
let cellBarGeometry: THREE.CylinderGeometry | null = null;
export function getCellBarGeometry(): THREE.CylinderGeometry {
  if (!cellBarGeometry) {
    cellBarGeometry = new THREE.CylinderGeometry(0.03, 0.03, CORRIDOR.cellOpeningHeight - 0.04, 7);
  }
  return cellBarGeometry;
}

/** Warm glow panel behind a cell's bars (instanced across all cells). */
let cellGlowGeometry: THREE.BoxGeometry | null = null;
export function getCellGlowGeometry(): THREE.BoxGeometry {
  if (!cellGlowGeometry) {
    // x = thin depth (inside the 0.5 m wall), y/z = slightly under the hole.
    cellGlowGeometry = new THREE.BoxGeometry(
      0.08,
      CORRIDOR.cellOpeningHeight - 0.22,
      CORRIDOR.cellOpeningWidth - 0.24,
    );
  }
  return cellGlowGeometry;
}

/** Wall lamp capsule (instanced across all lamps). */
let lampGeometry: THREE.BoxGeometry | null = null;
export function getLampGeometry(): THREE.BoxGeometry {
  if (!lampGeometry) {
    lampGeometry = new THREE.BoxGeometry(0.16, 0.1, 0.44);
  }
  return lampGeometry;
}

// ── Detail geometry (Phase 3) — all merged single draws, authored once. ─────

/** Ceiling cross-beam spanning the corridor (one instanced draw). */
let beamGeometry: THREE.BoxGeometry | null = null;
export function getBeamGeometry(): THREE.BoxGeometry {
  if (!beamGeometry) {
    beamGeometry = new THREE.BoxGeometry(CORRIDOR.wallHalfWidth * 2 + 0.06, 0.16, 0.2);
  }
  return beamGeometry;
}

/**
 * Pilaster between the cell bays: shaft + base + capital, merged so the
 * whole structural rhythm costs ONE draw. Authored with y = 0 on the floor.
 */
let pilasterGeometry: THREE.BufferGeometry | null = null;
export function getPilasterGeometry(): THREE.BufferGeometry {
  if (!pilasterGeometry) {
    const shaft = new THREE.BoxGeometry(0.1, CORRIDOR.height, 0.34);
    shaft.translate(0, CORRIDOR.height / 2, 0);
    const base = new THREE.BoxGeometry(0.14, 0.24, 0.44);
    base.translate(0, 0.12, 0);
    const cap = new THREE.BoxGeometry(0.14, 0.12, 0.44);
    cap.translate(0, CORRIDOR.height - 0.14, 0);
    pilasterGeometry = mergeGeometries([shaft, base, cap])!;
  }
  return pilasterGeometry;
}

/**
 * Cell entrance hardware, authored in CELL-LOCAL space (y0 = opening centre,
 * +z toward the corridor): lintel plate, floor threshold, two hinge stubs
 * and a latch plate. Instanced once per cell via each cell's matrix.
 */
let cellTrimGeometry: THREE.BufferGeometry | null = null;
export function getCellTrimGeometry(): THREE.BufferGeometry {
  if (!cellTrimGeometry) {
    const parts: THREE.BufferGeometry[] = [];
    const lintel = new THREE.BoxGeometry(1.9, 0.09, 0.07);
    lintel.translate(0, 1.2, 0.19);
    parts.push(lintel);
    const threshold = new THREE.BoxGeometry(1.9, 0.045, 0.2);
    threshold.translate(0, -1.278, 0.05);
    parts.push(threshold);
    for (const y of [0.55, -0.55]) {
      const hinge = new THREE.BoxGeometry(0.07, 0.17, 0.1);
      hinge.translate(-0.78, y, 0.12);
      parts.push(hinge);
    }
    const latch = new THREE.BoxGeometry(0.12, 0.24, 0.09);
    latch.translate(0.78, 0, 0.12);
    parts.push(latch);
    cellTrimGeometry = mergeGeometries(parts)!;
  }
  return cellTrimGeometry;
}

/**
 * Cell interior silhouette (bunk), authored in CELL-LOCAL space, entirely
 * inside the 0.45 m wall pocket so it reads as a dark shape against the
 * glow panel through the bars. Slab + two legs, merged.
 */
let bunkGeometry: THREE.BufferGeometry | null = null;
export function getBunkGeometry(): THREE.BufferGeometry {
  if (!bunkGeometry) {
    const slab = new THREE.BoxGeometry(0.95, 0.055, 0.36);
    slab.translate(0, -0.61, -0.2);
    const legA = new THREE.BoxGeometry(0.05, 0.5, 0.05);
    legA.translate(0.4, -1.05, -0.2);
    const legB = new THREE.BoxGeometry(0.05, 0.5, 0.05);
    legB.translate(-0.4, -1.05, -0.2);
    bunkGeometry = mergeGeometries([slab, legA, legB])!;
  }
  return bunkGeometry;
}

/**
 * Wall-fixture housing (canopy + wall arm), authored at the lamp centre
 * with +x toward the wall. Left-side lamps are the same matrix rotated 180°.
 */
let lampHousingGeometry: THREE.BufferGeometry | null = null;
export function getLampHousingGeometry(): THREE.BufferGeometry {
  if (!lampHousingGeometry) {
    const canopy = new THREE.BoxGeometry(0.2, 0.07, 0.52);
    canopy.translate(0, 0.085, 0);
    const arm = new THREE.BoxGeometry(0.13, 0.12, 0.14);
    arm.translate(0.1, 0.085, 0);
    lampHousingGeometry = mergeGeometries([canopy, arm])!;
  }
  return lampHousingGeometry;
}

/**
 * Junction box + riser feeding a fixture, authored at the lamp centre
 * (+x toward the wall) — the conduit visually terminates in the box.
 */
let feedGeometry: THREE.BufferGeometry | null = null;
export function getFeedGeometry(): THREE.BufferGeometry {
  if (!feedGeometry) {
    const box = new THREE.BoxGeometry(0.16, 0.15, 0.12);
    box.translate(0.01, -0.38, 0);
    const riser = new THREE.CylinderGeometry(0.02, 0.02, 0.36, 8);
    riser.translate(0, -0.13, 0);
    feedGeometry = mergeGeometries([box, riser])!;
  }
  return feedGeometry;
}

/** Fake floor light pool — flat disc, instance-scaled per lamp. */
let poolGeometry: THREE.CircleGeometry | null = null;
export function getPoolGeometry(): THREE.CircleGeometry {
  if (!poolGeometry) {
    poolGeometry = new THREE.CircleGeometry(1, 24);
    poolGeometry.rotateX(-Math.PI / 2);
  }
  return poolGeometry;
}

/** Open light shaft (top r 0.16 → bottom r 0.62), gradient-mapped. */
let coneGeometry: THREE.CylinderGeometry | null = null;
export function getConeGeometry(): THREE.CylinderGeometry {
  if (!coneGeometry) {
    coneGeometry = new THREE.CylinderGeometry(0.16, 0.62, 2.1, 12, 1, true);
  }
  return coneGeometry;
}

/** Dust motes scattered through hall + corridor (static buffer).
 *  ~45% of the motes cluster around the wall fixtures (where light actually
 *  is — visible motes need something to catch), the rest stay uniform. */
export function createDustGeometry(
  count: number,
  lamps: readonly { x: number; y: number; z: number }[] = [],
): THREE.BufferGeometry {
  const positions = new Float32Array(count * 3);
  let seed = 1337;
  const rand = (): number => {
    // Tiny deterministic PRNG so the dust field is stable between reloads.
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const gauss = (): number => (rand() + rand() + rand()) / 3 - 0.5;
  for (let i = 0; i < count; i++) {
    if (lamps.length > 0 && rand() < 0.45) {
      // Clustered: inside the pool of one of the fixtures.
      const lamp = lamps[Math.floor(rand() * lamps.length)]!;
      positions[i * 3] = lamp.x + gauss() * 2.4;
      positions[i * 3 + 1] = lamp.y - 0.5 + gauss() * 1.8;
      positions[i * 3 + 2] = lamp.z + gauss() * 3.2;
      // Clamp back into the set (never drift through the walls).
      positions[i * 3] = Math.max(
        -(CORRIDOR.wallHalfWidth - 0.2),
        Math.min(CORRIDOR.wallHalfWidth - 0.2, positions[i * 3]!),
      );
      positions[i * 3 + 1] = Math.max(0.15, Math.min(CORRIDOR.height - 0.3, positions[i * 3 + 1]!));
      positions[i * 3 + 2] = Math.max(-44, Math.min(6, positions[i * 3 + 2]!));
    } else {
      positions[i * 3] = (rand() * 2 - 1) * (CORRIDOR.wallHalfWidth - 0.25);
      positions[i * 3 + 1] = 0.15 + rand() * (CORRIDOR.height - 0.4);
      positions[i * 3 + 2] = -44 + rand() * 50; // corridor + entry hall
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geometry;
}

/** Shell mesh dimensions — plain data the environment renders declaratively. */
export interface ShellParts {
  readonly floorLength: number;
  readonly floorZ: number;
  readonly hallWallLength: number;
  readonly hallWallZ: number;
  readonly corridorWallLength: number;
  readonly corridorWallZ: number;
}

export function getShell(): ShellParts {
  const zStart = CORRIDOR.hallZEnd; // +6.5
  const zEnd = CORRIDOR.zEnd - 0.5; // -45.5
  const fullLength = zStart - zEnd;
  const corridorLength = 0 - zEnd;
  return {
    floorLength: fullLength,
    floorZ: (zStart + zEnd) / 2,
    hallWallLength: CORRIDOR.hallZEnd,
    hallWallZ: CORRIDOR.hallZEnd / 2,
    corridorWallLength: corridorLength,
    corridorWallZ: zEnd / 2,
  };
}
