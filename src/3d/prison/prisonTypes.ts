// ============================================================================
// PRISON TYPES — shared dimensions and layout data structures.
// ----------------------------------------------------------------------------s
// CORRIDOR is the single source of truth for world dimensions: the gate
// facade, the corridor shell and the cells all agree
// because they all read it from here. Authored (controlled cinematic set),
// NOT procedural dungeon generation.
// ============================================================================

export type CellSide = "left" | "right";

export interface CellSlot {
  readonly id: string;
  readonly side: CellSide;
  /** World z of the cell centre (cells live on the wall plane). */
  readonly z: number;
  readonly index: number;
}

export interface LampSlot {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  /** Base brightness of this lamp (0..1) — subtle rhythm variation. */
  readonly warmth: number;
}

export interface CellGlow {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  /** Per-cell brightness rhythm (0.15..1) — some cells stay darker. */
  readonly warmth: number;
}

export interface CorridorLayout {
  readonly cellSpacing: number;
  readonly cells: readonly CellSlot[];
  /** One glow panel behind the bars per cell, in `cells` order. */
  readonly glows: readonly CellGlow[];
  /** Wall lamps (per cell) + entry-hall lamps. */
  readonly lamps: readonly LampSlot[];
}

/** World dimensions (Y-up, metres). Gate plane at z = 0, corridor at -Z. */
export const CORRIDOR = {
  /** Interior face of the corridor walls. */
  wallHalfWidth: 2.4,
  wallThickness: 0.5,
  height: 3.4,
  /** Far interior wall. */
  zEnd: -45,
  /** Entry hall behind the gate (camera starts here). */
  hallZEnd: 6.5,
  // Cell opening (the hole punched through the wall).
  cellOpeningWidth: 1.7,
  cellOpeningHeight: 2.3,
  /** Cell frame sits proud of the wall by this much. */
  frameProtrusion: 0.05,
  cellFrameWidth: 2.6,
  cellFrameHeight: 2.55,
  /** World y of the cell opening centre (opening spans 0.15 .. 2.45). */
  cellCenterY: 1.3,
  /** Lamps hang above the cells. */
  lampY: 3.0,
} as const;
