// ============================================================================
// GATE TYPES — geometry constants, schedule and pose for the double-leaf gate.
// ----------------------------------------------------------------------------s
// The schedule is derived from the SAME shot durations the camera uses
// (built via buildGateTimeline in sequence.config), so the lock/rattle/swing
// beats can never drift from the camera choreography — one clock, one truth.
// ============================================================================

import { CORRIDOR } from "../prison/prisonTypes";

export interface GateTimelineEntry {
  readonly start: number;
  readonly duration: number;
}

/** shot id → absolute start time / duration (seconds). */
export interface GateTimeline {
  [shotId: string]: GateTimelineEntry | undefined;
}

export type GatePhase = "locked" | "jitter" | "unlocking" | "opening" | "open";

/** Fully resolved pose for one frame — written straight to object transforms. */
export interface GatePose {
  /** Left leaf rotation about Y (positive opens into the corridor). */
  leftAngle: number;
  /** Right leaf rotation about Y (mirrored: negative opens inward). */
  rightAngle: number;
  /** Bolt slide in leaf-local metres (0 = thrown, negative = retracted). */
  boltOffset: number;
  /** Key/handle knob rotation (radians). */
  knobAngle: number;
  phase: GatePhase;
}

export interface GateDimensions {
  readonly openingWidth: number;
  readonly openingHeight: number;
  readonly frameThickness: number;
  readonly frameDepth: number;
  readonly leafGap: number;
  readonly leafDepth: number;
  /** Height of the corridor the gate sits in (matches CORRIDOR.height). */
  readonly corridorHeight: number;
  /** Interior wall face — facade wings run from the jamb out to here. */
  readonly wallHalfWidth: number;
}

export const GATE_DIMENSIONS: GateDimensions = {
  openingWidth: 3.4,
  openingHeight: 3.0,
  frameThickness: 0.22,
  frameDepth: 0.35,
  leafGap: 0.04,
  leafDepth: 0.09,
  corridorHeight: CORRIDOR.height,
  wallHalfWidth: CORRIDOR.wallHalfWidth,
};

/** ~100° — leaves fold almost flat against the corridor walls. */
export const GATE_OPEN_ANGLE_RAD = 1.75;

/** Absolute times (seconds) of the mechanical beats. */
export interface GateSchedule {
  readonly jitterStart: number;
  readonly jitterDuration: number;
  readonly knobStart: number;
  readonly knobDuration: number;
  readonly boltStart: number;
  readonly boltDuration: number;
  readonly swingStart: number;
  readonly swingDuration: number;
}

/**
 * Beat offsets inside the "gatePush" shot, expressed as a FRACTION of its
 * duration — so the whole unlock (rattle → knob → bolt) always fits inside
 * the push regardless of how the shot is re-timed, and always finishes
 * before the leaves start swinging in the following "gateOpen" shot.
 */
const PUSH_FRACTIONS = {
  jitter: 0.15,
  knob: 0.56,
  bolt: 0.65,
} as const;

export function buildGateSchedule(timeline: GateTimeline): GateSchedule {
  const push = timeline["gatePush"] ?? { start: 1.0, duration: 1.5 };
  const open = timeline["gateOpen"] ?? { start: 2.6, duration: 1.5 };
  return {
    // Rattle while the camera pushes in on the lock.
    jitterStart: push.start + push.duration * PUSH_FRACTIONS.jitter,
    jitterDuration: Math.min(0.5, push.duration * 0.6),
    // Handle turns, then the bolt snaps back — before the leaves move.
    knobStart: push.start + push.duration * PUSH_FRACTIONS.knob,
    knobDuration: Math.min(0.3, push.duration * 0.25),
    boltStart: push.start + push.duration * PUSH_FRACTIONS.bolt,
    boltDuration: Math.min(0.22, push.duration * 0.2),
    // Heavy leaves swing during the "gateOpen" shot.
    swingStart: open.start + 0.05,
    swingDuration: Math.min(1.35, open.duration * 0.82),
  };
}
