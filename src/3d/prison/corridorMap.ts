// ============================================================================
// CORRIDOR MAP — the authored layout of the cinematic prison set.
// ----------------------------------------------------------------------------s
// This is a controlled environment: cells sit on a fixed rhythm down both
// walls, lamps alternate with them, and every depth is authored. Nothing is
// randomly generated — this is a film set, not a procedural dungeon.
// ============================================================================

import {
  CORRIDOR,
  type CellGlow,
  type CellSide,
  type CellSlot,
  type CorridorLayout,
  type LampSlot,
} from "./prisonTypes";

/** First cell — just past the gate so the reveal starts close. */
const FIRST_CELL_Z = -4;
/** Deepest cell — far down the corridor, past the handoff framing. */
const LAST_CELL_Z = -38;
/** Entry-hall lamp height/x for the two lamps behind the gate. */
const HALL_LAMP_Z = 2.4;
const LAMP_X = 2.32;
/** Warmth rhythm: alternate lamps are dimmer so the corridor breathes. */
function lampWarmth(index: number): number {
  return index % 2 === 0 ? 1 : 0.72;
}

/**
 * Per-cell glow brightness rhythm — a couple of cells stay near-dark so the
 * block never reads as a uniform row of identical light boxes.
 */
const CELL_WARMTH = [1, 0.72, 0.9, 0.5, 0.95, 0.64, 0.18, 0.84] as const;

export function createCorridorLayout(cellSpacing: number): CorridorLayout {
  const cells: CellSlot[] = [];
  const glows: CellGlow[] = [];
  const lamps: LampSlot[] = [];

  let index = 0;
  for (let z = FIRST_CELL_Z; z >= LAST_CELL_Z; z -= cellSpacing) {
    for (const side of ["right", "left"] as const) {
      const x = side === "right" ? CORRIDOR.wallHalfWidth : -CORRIDOR.wallHalfWidth;
      cells.push({ id: `${side}-${index}`, side, z, index });
      // Glow panel sits at the BACK of the wall opening (wall is 0.5 thick).
      const warmthIndex = (index * 2 + (side === "left" ? 1 : 0)) % CELL_WARMTH.length;
      glows.push({
        x: side === "right" ? CORRIDOR.wallHalfWidth + 0.45 : -(CORRIDOR.wallHalfWidth + 0.45),
        y: CORRIDOR.cellCenterY,
        z,
        warmth: CELL_WARMTH[warmthIndex]!,
      });
      lamps.push({
        x: side === "right" ? LAMP_X : -LAMP_X,
        y: CORRIDOR.lampY,
        z,
        warmth: lampWarmth(lamps.length),
      });
    }
    index++;
  }

  // Two lamps in the entry hall (the room the camera starts in).
  lamps.push(
    { x: -LAMP_X, y: CORRIDOR.lampY, z: HALL_LAMP_Z, warmth: 0.55 },
    { x: LAMP_X, y: CORRIDOR.lampY, z: HALL_LAMP_Z, warmth: 0.55 },
  );

  return { cellSpacing, cells, glows, lamps };
}
