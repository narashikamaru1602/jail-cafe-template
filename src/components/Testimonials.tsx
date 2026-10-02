import { ratings } from "@/data/restaurant";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

// ----------------------------------------------------------------------------
// RATINGS (rendered by the Testimonials component) — placeholder rating
// plates instead of quotes: reviews must never be fabricated. Three iron
// plates: score · source · count. Replace the placeholders in restaurant.ts
// with your restaurant's real published ratings.
// ----------------------------------------------------------------------------
export function Testimonials() {
  return (
    <section className="relative border-t border-border">
      <div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:py-28">
        <SectionHeading
          eyebrow="The Verdict"
          title="How guests rate us"
          subtitle="Ratings from guest review platforms."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-3 lg:mt-16">
          {ratings.map((r, i) => (
            <Reveal key={`${r.source}-${r.scope}`} delay={i * 90}>
              <figure className="iron-panel flex h-full flex-col items-center px-6 py-10 text-center">
                <span
                  className={`font-display leading-none whitespace-nowrap text-primary ${
                    r.score.length > 3 ? "text-5xl sm:text-6xl" : "text-6xl sm:text-7xl"
                  }`}
                >
                  {r.score}
                </span>
                <span className="mt-3 font-mono text-[0.58rem] tracking-[0.3em] text-muted-foreground uppercase">
                  out of 5
                </span>
                <figcaption className="mt-7">
                  <span className="block font-display text-xl">{r.source}</span>
                  <span className="mt-1.5 block text-sm text-muted-foreground">{r.scope}</span>
                  <span className="mt-4 block">
                    <span className="cell-plate-steel">{r.count}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-center font-mono text-[0.6rem] tracking-[0.22em] text-muted-foreground uppercase">
          Platform ratings as of September 2026
        </p>
      </div>
    </section>
  );
}
