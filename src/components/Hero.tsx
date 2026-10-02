import { Link } from "@tanstack/react-router";
import { restaurant } from "@/data/restaurant";

// ----------------------------------------------------------------------------
// HERO — "YOUR CELL AWAITS".
// The romantic café photo is gone: the hero is now a CSS-built fragment of
// the same world the intro camera walks through — near-black corridor, a
// warm lamp glow, faint vertical iron rods, grain and an inset iron frame.
// No heavy assets: gradients + pseudo layers only, so it stays instant.
// Content staggers in via the .hero-rise keyframe (disabled under
// prefers-reduced-motion in styles.css).
// ----------------------------------------------------------------------------
const HERO_FACTS = ["[CUISINE]", "[SPECIALTY]", "[CITY]"];

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-background">
      {/* 1 — corridor lamp: warm radial bloom from above (the light the gate
          opened into). Subtle flicker via .lamp. */}
      <div
        aria-hidden="true"
        className="lamp absolute inset-0"
        style={{
          background:
            "radial-gradient(115% 75% at 50% 16%, color-mix(in oklab, var(--color-ember) 26%, transparent) 0%, color-mix(in oklab, var(--color-ember) 8%, transparent) 38%, transparent 62%)",
        }}
      />

      {/* 2 — the bars: same iron rhythm as the gate, held behind content. */}
      <div aria-hidden="true" className="bar-field absolute inset-0 opacity-70" />

      {/* 3 — vignette so type always wins contrast. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: "radial-gradient(75% 65% at 50% 42%, transparent 25%, rgb(0 0 0 / 72%) 100%)",
        }}
      />

      {/* 4 — floor shadow + grain, keeping the near-black from going flat. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
      />
      <div aria-hidden="true" className="grain absolute inset-0 opacity-[0.05]" />

      {/* 5 — inset iron frame with corner rivets (the cell-door surround). */}
      <div
        aria-hidden="true"
        className="rivets pointer-events-none absolute inset-3 border border-white/10 sm:inset-5"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-6 pt-32 pb-32 sm:px-10">
        <span className="hero-rise cell-plate w-fit" style={{ animationDelay: "80ms" }}>
          {restaurant.name} — {restaurant.city}
        </span>

        <h1
          className="hero-rise mt-7 max-w-[13ch] font-display text-[2.65rem] leading-[1.04] tracking-[0.03em] text-white uppercase sm:text-6xl lg:text-[5.4rem] lg:tracking-[0.07em]"
          style={{ animationDelay: "200ms" }}
        >
          Your cell <span className="italic text-primary">awaits</span>
        </h1>

        <div className="hero-rise mt-7 flex items-center gap-4" style={{ animationDelay: "340ms" }}>
          <span className="h-px w-12 bg-primary/70" />
          <p className="max-w-md text-[0.95rem] leading-relaxed text-white/75 sm:text-lg">
            {restaurant.name} — a cinematic jail-themed café.
          </p>
        </div>

        <div className="hero-rise mt-7 flex flex-wrap gap-2.5" style={{ animationDelay: "440ms" }}>
          {HERO_FACTS.map((fact) => (
            <span key={fact} className="cell-plate-steel">
              {fact}
            </span>
          ))}
        </div>

        <div
          className="hero-rise mt-11 flex flex-col gap-3.5 sm:flex-row sm:items-center sm:gap-4"
          style={{ animationDelay: "560ms" }}
        >
          <Link
            to="/menu"
            className="border border-primary bg-primary px-8 py-4 text-center text-[0.72rem] font-medium tracking-[0.22em] text-primary-foreground uppercase transition-colors duration-300 hover:bg-transparent hover:text-primary sm:px-9"
          >
            Explore the Menu
          </Link>
          <Link
            to="/contact"
            hash="reserve"
            className="border border-white/30 px-8 py-4 text-center text-[0.72rem] tracking-[0.22em] text-white/85 uppercase transition-colors duration-300 hover:border-primary hover:text-primary sm:px-9"
          >
            Book Your Table
          </Link>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="pointer-events-none absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 sm:flex">
        <span className="font-mono text-[0.58rem] tracking-[0.4em] text-white/55 uppercase">
          Enter
        </span>
        <span className="h-12 w-px bg-gradient-to-b from-primary/80 to-transparent" />
      </div>
    </section>
  );
}
