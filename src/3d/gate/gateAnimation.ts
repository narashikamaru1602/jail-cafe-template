// ============================================================================
// GATE ANIMATION — pure, time-driven pose for the double-leaf prison gate.
// ----------------------------------------------------------------------------s
// getGatePose is a PURE function of (absolute sequence time, schedule): no
// GSAP, no React state, no frame counting. CameraRig advances the shared
// clock; JailGate reads the pose from here and writes it straight onto the
// hinge groups each frame.
//
// Choreography (concept: reference DoorSection handle→door ordering,
// reimplemented — that file carries no license):
//   lock rattle → handle turns → bolt snaps back → both leaves swing open
//   with mirrored rotation (left +angle, right -angle), opening INTO the
//   corridor so the camera can pass between them.
// ============================================================================

import { EASINGS } from "../cinematic/ShotPlayer";
import { GATE_OPEN_ANGLE_RAD, type GatePhase, type GatePose, type GateSchedule } from "./gateTypes";

/** How far the locking bolt retracts into its housing (metres). */
export const BOLT_RETRACTION = -0.16;
/** Rattle amplitude of the bolt while the lock is being tested. */
export const BOLT_RATTLE = 0.012;

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function getGatePose(time: number, schedule: GateSchedule): GatePose {
  let phase: GatePhase = "locked";
  let angle = 0;
  let bolt = 0;
  let knob = 0;

  // 1. Lock rattle — decaying sine on the bolt while the camera pushes in.
  if (time >= schedule.jitterStart) {
    const j = clamp01((time - schedule.jitterStart) / schedule.jitterDuration);
    if (j < 1) {
      phase = "jitter";
      bolt += Math.sin(j * Math.PI * 9) * BOLT_RATTLE * (1 - j);
    }
  }

  // 2. Handle/key turns.
  if (time >= schedule.knobStart) {
    const p = clamp01((time - schedule.knobStart) / schedule.knobDuration);
    knob = EASINGS.easeInOutCubic(p) * (Math.PI / 2);
    if (p > 0) phase = "unlocking";
  }

  // 3. Bolt snaps back (ease-in — it is being pulled, not eased out).
  if (time >= schedule.boltStart) {
    const p = clamp01((time - schedule.boltStart) / schedule.boltDuration);
    if (p > 0) phase = "unlocking";
    bolt += EASINGS.easeInCubic(p) * BOLT_RETRACTION;
  }

  // 4. Heavy leaves swing — inertia at the start, weighted settle at the end.
  if (time >= schedule.swingStart) {
    const p = clamp01((time - schedule.swingStart) / schedule.swingDuration);
    angle = EASINGS.easeInOutQuart(p) * GATE_OPEN_ANGLE_RAD;
    phase = p <= 0 ? phase : p < 1 ? "opening" : "open";
  }

  return {
    leftAngle: angle,
    rightAngle: -angle,
    boltOffset: bolt,
    knobAngle: knob,
    phase,
  };
}
