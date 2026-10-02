// ============================================================================
// INTRO — DOM-level configuration for the opening sequence.
// ----------------------------------------------------------------------------
// Only what the DOM orchestrator (IntroExperience) needs: session flags, the
// skip delay, the ready-safety timeout and the overlay fade durations.
// 3D-side tuning lives with its own systems (shots.config, gateTypes,
// atmosphereConfig, quality) — this file no longer holds camera/door/color
// constants, which moved to src/3d with the systems that use them.
// ============================================================================

/** sessionStorage flag so the intro doesn't replay on every visit within the
 *  same tab session (only on a fresh load/new tab). Bump the suffix if the
 *  sequence changes enough that returning visitors should see it again. */
export const INTRO_SESSION_KEY = "jail-intro-seen-v1";

/** Flip to false during development to always see the full sequence. */
export const SKIP_INTRO_IF_ALREADY_SEEN = true;

/** Delay before the Skip button fades in — avoids it flashing on top of a
 *  still-black frame. */
export const SKIP_BUTTON_DELAY_MS = 250;

/** If the 3D scene never signals "ready" within this window (ms), bail to the
 *  fallback fade. Combined with the asset preload timeout, this guarantees a
 *  visitor is NEVER trapped behind the intro, even if the scene fails. */
export const READY_TIMEOUT_MS = 7000;

/** How long the overlay takes to fade away, per exit reason (ms). */
export const EXIT_MS = {
  natural: 400,
  skip: 300,
  fallback: 300,
} as const;

export type ExitReason = keyof typeof EXIT_MS;

/** UI-integration hook: dispatched (window CustomEvent, detail = exit reason)
 *  the moment the overlay begins fading, so the UI side can play the short
 *  cinematic→interface light transition (src/components/IntroHandoff.tsx).
 *  One-directional: the intro never listens for or depends on this event, so
 *  cinematic behavior is unchanged whether or not a listener exists. */
export const INTRO_EXIT_EVENT = "cellhouse:intro-exit";
