// ============================================================================
// SHOTS — camera choreography data only (no logic, no side effects).
// ----------------------------------------------------------------------------s
// World frame: Y-up, metres. The gate sits at z = 0, the camera starts OUTSIDE
// in the entry hall (positive z) and moves a SHORT distance into the corridor
// (negative z). The whole cinematic is ~2.7 seconds (≈3s including the 400ms
// handoff fade): read the closed gate, watch the lock work, see the leaves
// swing open, then step just through the doorway for a short interior reveal
// before the website takes over. There is deliberately no corridor fly-through
// and no path travel — motion is a single controlled forward dolly through the
// opening.
//
// Pacing contract (see sequence.config for the ordered list):
//   0.0–0.3s   gateEstablish — closed gate dominates the frame, slow drift
//   0.3–0.9s   gatePush      — tight approach; lock rattle/handle/bolt
//   0.9–2.2s   gateOpen      — leaves swing while the camera steps through
//   2.2–2.6s   entering      — settle inside; cells and lamps reveal
//   2.6–2.7s   heroHandoff   — clean settle that crossfades into the site
//
// Control points of consecutive shots are authored to meet, so the damped
// CameraRig never snaps between shots.
// ============================================================================

import type { ShotDefinition } from "./ShotPlayer";

/** Slight upward tilt where the two leaves meet — the lock. */
const LOCK_TARGET: [number, number, number] = [0, 1.45, 0];

/** 0.0–0.3s — the closed gate dominates the frame; a slow, patient drift. */
export const gateEstablishShot: ShotDefinition = {
  id: "gateEstablish",
  duration: 0.3,
  easing: "easeOutSine",
  position: [
    [0, 1.62, 4.2],
    [0, 1.61, 4.0],
  ],
  target: [[0, 1.52, 0], LOCK_TARGET],
  fovStart: 46,
  fovEnd: 45,
};

/**
 * 0.3–0.9s — mechanical approach. The camera holds its nerve while the lock
 * rattles, the handle turns and the bolt snaps back; the framing tightens
 * (FOV 45→40) so the mechanism reads as the subject. The unlock beats are
 * fractions of this shot's duration (see gateTypes PUSH_FRACTIONS), so the
 * whole latch sequence always fits inside the push.
 */
export const gatePushShot: ShotDefinition = {
  id: "gatePush",
  duration: 0.6,
  easing: "easeInOutCubic",
  position: [
    [0, 1.61, 4.0],
    [0, 1.59, 3.6],
    [0, 1.55, 3.2],
  ],
  target: [LOCK_TARGET, [0, 1.44, 0]],
  fovStart: 45,
  fovEnd: 40,
};

/**
 * 0.9–2.2s — the leaves swing open AND the camera glides forward through the
 * doorway. The swing (gateOpen.start + 0.05, ~1.07s) clears the centre of
 * the opening well before the camera reaches the gate plane (~2.0s), and
 * easeInOutSine decelerates the dolly through the crossing — a person
 * entering, never a fly-through.
 */
export const gateOpenShot: ShotDefinition = {
  id: "gateOpen",
  duration: 1.3,
  easing: "easeInOutSine",
  position: [
    [0, 1.55, 3.2],
    [0, 1.57, 2.1],
    [0, 1.59, 0.7],
    [0, 1.6, -0.5],
  ],
  target: [
    [0, 1.44, 0],
    [0, 1.46, -1.5],
    [0, 1.49, -3],
    [0, 1.5, -3.8],
  ],
  fovStart: 40,
  fovEnd: 46,
};

/**
 * 2.2–2.6s — a gentle settle just inside the gate; the cell glow and lamps
 * have a moment to breathe so the viewer reads the prison environment before
 * the handoff.
 */
export const enteringShot: ShotDefinition = {
  id: "entering",
  duration: 0.4,
  easing: "easeInOutSine",
  position: [
    [0, 1.6, -0.5],
    [0, 1.62, -0.8],
    [0, 1.63, -1],
  ],
  target: [
    [0, 1.5, -3.8],
    [0, 1.52, -4.6],
    [0, 1.5, -5.2],
  ],
  fovStart: 46,
  fovEnd: 47,
};

/**
 * 2.6–2.7s — decelerating settle on the frame that crossfades into the
 * website hero: the sequence ends on a composed image, not a cut.
 */
export const heroHandoffShot: ShotDefinition = {
  id: "heroHandoff",
  duration: 0.1,
  easing: "easeOutCubic",
  position: [
    [0, 1.63, -1],
    [0, 1.63, -1.05],
  ],
  target: [
    [0, 1.5, -5.2],
    [0, 1.5, -5.5],
  ],
  fovStart: 47,
  fovEnd: 45,
};
