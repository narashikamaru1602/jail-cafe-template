import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { canRunIntroScene } from "./device-support";
import {
  EXIT_MS,
  INTRO_EXIT_EVENT,
  INTRO_SESSION_KEY,
  READY_TIMEOUT_MS,
  SKIP_BUTTON_DELAY_MS,
  SKIP_INTRO_IF_ALREADY_SEEN,
  type ExitReason,
} from "./constants";
import type { JailDoorCanvasHandle } from "./JailDoorCanvas";

// ============================================================================
// IntroExperience
// ----------------------------------------------------------------------------
// BLACK SCREEN → 3D JAIL GATE CLOSE-UP → UNLOCK → DOUBLE LEAVES OPEN →
// VIEWER STEPS THROUGH → DARK INTERIOR REVEALED → WEBSITE.
//
// This component is the only thing that knows about "phases" — it renders a
// plain, opaque black overlay (safe to render on the server, so there's no
// flash of the real hero before this mounts), then on the client decides
// whether to actually play the 3D sequence or fall straight through to a
// quick fade:
//
//   - prefers-reduced-motion is on (single source: hooks/use-reduced-motion)
//   - WebGL isn't available / the device looks low-end
//   - the intro already played earlier this tab session
//
// While the 3D chunk loads it shows a quiet loader, backed by a hard
// READY_TIMEOUT_MS safety net: if the scene never signals readiness (or
// fails outright), we fade to the site exactly like the fallback path. The
// user is never trapped behind the intro.
//
// The real <Hero> (and the rest of the homepage) is rendered by the route
// underneath this overlay the whole time, so removing the overlay is all
// that's needed to "reveal" it — no content is gated behind client JS.
//
// three.js / @react-three/fiber / drei are loaded lazily and only when the
// 3D sequence is actually going to play.
// ============================================================================

const JailDoorCanvas = lazy(() =>
  import("./JailDoorCanvas").then((m) => ({ default: m.JailDoorCanvas })),
);

type Phase = "decide" | "playing" | "fallback" | "exiting" | "done";

export function IntroExperience() {
  const [phase, setPhase] = useState<Phase>("decide");
  const [showSkip, setShowSkip] = useState(false);
  const [ready, setReady] = useState(false);
  const [exitMs, setExitMs] = useState<number>(EXIT_MS.natural);

  const sceneRef = useRef<JailDoorCanvasHandle>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readyRef = useRef(false);
  const decidedRef = useRef(false);

  const reducedMotion = useReducedMotion();

  const beginExit = useCallback((reason: ExitReason) => {
    sessionStorage.setItem(INTRO_SESSION_KEY, "1");
    // UI-integration hook only (see INTRO_EXIT_EVENT): tells the website UI
    // that the gate handoff has begun so it can play its light transition.
    // The intro itself behaves identically with or without a listener.
    window.dispatchEvent(new CustomEvent(INTRO_EXIT_EVENT, { detail: reason }));
    setExitMs(EXIT_MS[reason]);
    setPhase("exiting");
    exitTimeoutRef.current = setTimeout(() => setPhase("done"), EXIT_MS[reason]);
  }, []);

  // Decide once, on the client, whether to play the 3D sequence.
  useEffect(() => {
    if (decidedRef.current) return;
    const alreadySeen =
      SKIP_INTRO_IF_ALREADY_SEEN && sessionStorage.getItem(INTRO_SESSION_KEY) === "1";

    decidedRef.current = true;
    if (alreadySeen || reducedMotion || !canRunIntroScene()) {
      setPhase("fallback");
      return;
    }
    setPhase("playing");
  }, [reducedMotion]);

  // Skip button appears a beat after the sequence starts, not on the first
  // black frame.
  useEffect(() => {
    if (phase !== "playing") return;
    const t = setTimeout(() => setShowSkip(true), SKIP_BUTTON_DELAY_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // Keyboard/screen-reader safety while the overlay is opaque: the page
  // rendered underneath (header, homepage sections, footer) is hidden from
  // the a11y tree and the tab order via `inert`, and restored the moment the
  // intro completes. The overlay itself is excluded so its Skip control
  // stays operable. The animation sequence is untouched.
  useEffect(() => {
    if (phase === "done") return;
    const overlay = overlayRef.current;
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("header, footer, main > *"),
    ).filter((el) => el !== overlay);
    for (const el of nodes) {
      el.setAttribute("inert", "");
      el.setAttribute("aria-hidden", "true");
    }
    return () => {
      for (const el of nodes) {
        el.removeAttribute("inert");
        el.removeAttribute("aria-hidden");
      }
    };
  }, [phase]);

  // Fallback path: no 3D at all, just a quick fade so the site never feels
  // stuck behind a black screen.
  useEffect(() => {
    if (phase !== "fallback") return;
    beginExit("fallback");
  }, [phase, beginExit]);

  // Safety net: if the scene never signals readiness (failed chunk, WebGL
  // context creation failure, stalled assets), bail out to the site.
  useEffect(() => {
    if (phase !== "playing" || ready) return;
    const t = setTimeout(() => {
      if (!readyRef.current) beginExit("fallback");
    }, READY_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [phase, ready, beginExit]);

  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    };
  }, []);

  const handleReady = useCallback(() => {
    if (readyRef.current) return;
    readyRef.current = true;
    setReady(true);
  }, []);

  const handleSequenceComplete = useCallback(() => beginExit("natural"), [beginExit]);

  const handleSkip = useCallback(() => {
    setShowSkip(false);
    sceneRef.current?.skip();
    beginExit("skip");
  }, [beginExit]);

  if (phase === "done") return null;

  const visible = phase !== "exiting";
  const showLoader = phase === "playing" && !ready;

  return (
    <div
      ref={overlayRef}
      className={cn(
        "fixed inset-0 z-[60] bg-black transition-opacity ease-out",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      style={{ transitionDuration: `${exitMs}ms` }}
      role="presentation"
    >
      {phase === "playing" && (
        <Suspense fallback={null}>
          <JailDoorCanvas
            ref={sceneRef}
            onReady={handleReady}
            onSequenceComplete={handleSequenceComplete}
          />
        </Suspense>
      )}

      {/* Loading state — quiet brass placeholder while the lazy chunk and the
          scene settle (dismissed by the real "ready" signal). */}
      {showLoader && (
        <div
          className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-5"
          aria-hidden="true"
        >
          <span className="animate-pulse text-[0.62rem] tracking-[0.5em] text-[#c99a54]/80 uppercase">
            CELLHOUSE
          </span>
          <span className="h-px w-28 animate-pulse bg-[#c99a54]/40" />
        </div>
      )}

      {phase === "playing" && (
        <button
          type="button"
          onClick={handleSkip}
          className={cn(
            "absolute right-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-10",
            "min-h-11 min-w-11 rounded-sm border border-white/30 px-4 py-2.5",
            "text-[0.68rem] tracking-[0.24em] text-white/80 uppercase",
            "transition-all duration-300 hover:border-[#c99a54] hover:text-[#c99a54]",
            // `invisible` (visibility:hidden) while hidden so an invisible
            // Skip control can never receive keyboard focus.
            showSkip ? "opacity-100" : "invisible opacity-0",
          )}
          aria-label="Skip intro"
        >
          Skip
        </button>
      )}
    </div>
  );
}
