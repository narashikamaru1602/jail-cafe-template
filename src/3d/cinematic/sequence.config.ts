// ============================================================================
// SEQUENCE — orders the shots into the intro story and maps them to phases.
// ----------------------------------------------------------------------------s
//  BLACK ──► GATE CLOSE-UP ──► LOCK/BOLT ──► DOUBLE LEAVES OPEN ──► VIEWER
//  STEPS THROUGH ──► DARK INTERIOR REVEALED ──► WEBSITE
//
// Total run time is a deliberate ~2.7 s — plus the 400 ms overlay fade that
// is roughly 3 s from closed gate to website (still mobile-first); the skip
// button and the reduced-motion fallback both bypass it entirely.
// ============================================================================

import type { GateTimeline } from "../gate/gateTypes";
import {
  enteringShot,
  gateEstablishShot,
  gateOpenShot,
  gatePushShot,
  heroHandoffShot,
} from "./shots.config";

/** High level phases of the intro, derived from the current shot id. */
export type IntroPhase = "gate" | "entering" | "handoff" | "done";

export type ShotId = "gateEstablish" | "gatePush" | "gateOpen" | "entering" | "heroHandoff";

/** Shot order — the cinematic timeline itself. */
export const INTRO_SEQUENCE = [
  gateEstablishShot,
  gatePushShot,
  gateOpenShot,
  enteringShot,
  heroHandoffShot,
] as const;

const PHASE_BY_SHOT: Record<ShotId, IntroPhase> = {
  gateEstablish: "gate",
  gatePush: "gate",
  gateOpen: "gate",
  entering: "entering",
  heroHandoff: "handoff",
};

export function phaseForShot(shotId: string): IntroPhase {
  const phase = PHASE_BY_SHOT[shotId as ShotId];
  return phase ?? "gate";
}

/**
 * Absolute schedule for non-camera beats (bolt snap, leaf swing, light ramps)
 * derived from the SAME shot durations the camera uses — so gate/audio/light
 * choreography can never drift away from the camera choreography.
 */
export function buildGateTimeline(): GateTimeline {
  const timeline: GateTimeline = {};
  let cursor = 0;
  for (const shot of INTRO_SEQUENCE) {
    timeline[shot.id] = { start: cursor, duration: shot.duration };
    cursor += shot.duration;
  }
  return timeline;
}

export const SEQUENCE_DURATION_MS = Math.round(
  INTRO_SEQUENCE.reduce((sum, shot) => sum + shot.duration, 0) * 1000,
);
