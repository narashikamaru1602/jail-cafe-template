import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { INTRO_EXIT_EVENT } from "@/intro/constants";

// ----------------------------------------------------------------------------
// INTRO HANDOFF — the short light transition between the 3D gate sequence
// and the website UI (cinematic → interface, not a hard cut).
//
// Pure CSS, ~1.3s, pointer-events-none: an exposure flush, a warm bloom and
// a single diagonal light sweep as the intro overlay fades. Triggered by the
// INTRO_EXIT_EVENT dispatched from the intro the moment its exit begins —
// this component never interferes with the intro itself, and renders nothing
// when motion is reduced or the intro never plays.
// ----------------------------------------------------------------------------
export function IntroHandoff() {
  const reducedMotion = useReducedMotion();
  // Incremented per event so a fresh element (and animation) plays each time.
  const [playKey, setPlayKey] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const onExit = () => setPlayKey((k) => k + 1);
    window.addEventListener(INTRO_EXIT_EVENT, onExit);
    return () => window.removeEventListener(INTRO_EXIT_EVENT, onExit);
  }, [reducedMotion]);

  if (reducedMotion || playKey === 0) return null;

  return (
    <div
      key={playKey}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[65] overflow-hidden"
    >
      {/* exposure flush */}
      <div
        className="handoff-bloom absolute inset-0"
        style={{
          background: "color-mix(in oklab, var(--color-ember) 24%, transparent)",
          mixBlendMode: "screen",
        }}
      />
      {/* warm corridor bloom */}
      <div
        className="handoff-bloom absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 48% at 50% 44%, color-mix(in oklab, var(--color-primary) 42%, transparent) 0%, transparent 70%)",
          mixBlendMode: "screen",
          animationDelay: "80ms",
        }}
      />
      {/* single diagonal light sweep */}
      <div
        className="handoff-sweep absolute inset-y-0 -left-1/4 w-[45%]"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in oklab, var(--color-primary) 60%, transparent) 50%, transparent)",
          mixBlendMode: "screen",
          filter: "blur(2px)",
          animationDelay: "160ms",
        }}
      />
    </div>
  );
}
