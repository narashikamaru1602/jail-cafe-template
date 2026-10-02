import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { menuCategories } from "@/data/restaurant";
import { Reveal } from "./Reveal";

// ----------------------------------------------------------------------------
// MENU BAND — the "04 · MENU" call to action.
// A full-width iron band lit by the same corridor lamp as the hero: category
// plates across the middle, one clear CTA. Data-driven (category count and
// names come from the menu data), so it stays true if the menu grows.
// ----------------------------------------------------------------------------
export function MenuBanner() {
  return (
    <section className="relative overflow-hidden border-t border-border bg-background">
      {/* lamp bloom */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 120% at 50% 120%, color-mix(in oklab, var(--color-ember) 16%, transparent) 0%, transparent 60%)",
        }}
      />
      <div aria-hidden="true" className="bar-field absolute inset-0 opacity-40" />
      <div aria-hidden="true" className="grain absolute inset-0 opacity-[0.04]" />

      <div className="relative mx-auto max-w-[1400px] px-5 py-24 text-center sm:px-8 lg:py-28">
        <Reveal>
          <span className="cell-plate">The Menu</span>
          <h2 className="mx-auto mt-6 max-w-2xl font-display text-4xl leading-[1.08] text-balance sm:text-5xl lg:text-6xl">
            Every dish, <span className="italic text-primary">on the record</span>.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[0.95rem] text-muted-foreground">
            {menuCategories.length} categories · placeholder items · prices in ₹XXX.
          </p>

          <div className="mx-auto mt-9 flex max-w-3xl flex-wrap justify-center gap-2.5">
            {menuCategories.map((category) => (
              <span key={category} className="cell-plate-steel">
                {category}
              </span>
            ))}
          </div>

          <Link
            to="/menu"
            className="mt-11 inline-flex items-center gap-3 border border-primary bg-primary px-9 py-4 text-[0.72rem] font-medium tracking-[0.22em] text-primary-foreground uppercase transition-colors duration-300 hover:bg-transparent hover:text-primary"
          >
            Open the Menu <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
