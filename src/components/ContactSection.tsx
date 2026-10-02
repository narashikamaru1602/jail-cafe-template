import { MapPin, Phone } from "lucide-react";
import { locations, restaurant } from "@/data/restaurant";
import { Reveal } from "./Reveal";

// ----------------------------------------------------------------------------
// CONTACT / LOCATIONS — placeholder branches rendered as a record list
// (label · status plate · address · landmark · phone), with an hours table
// that falls back to a call prompt when no hours are set (see restaurant.ts).
// Right side: CSS map panel in the iron system (no third-party embed).
// ----------------------------------------------------------------------------
export function ContactSection() {
  const hasHours = restaurant.hours.length > 0;

  return (
    <section className="relative border-t border-border">
      <div className="mx-auto grid max-w-[1400px] gap-14 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:py-32">
        <Reveal>
          <span className="cell-plate w-fit">Find us</span>
          <h2 className="mt-6 font-display text-4xl leading-[1.1] sm:text-5xl">
            Locate the block.
          </h2>
          <p className="mt-3 text-sm tracking-[0.2em] text-muted-foreground uppercase">
            {restaurant.cuisine}
          </p>
          <div className="iron-rule mt-8" />

          {/* Branches */}
          <ol className="mt-6 border-t border-border">
            {locations.map((loc) => (
              <li key={loc.label} className="border-b border-border py-5">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <span className="font-display text-xl">{loc.label}</span>
                  <span className="cell-plate-steel">{loc.status}</span>
                </div>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                  {loc.address}
                </p>
                <p className="mt-2 font-mono text-[0.6rem] tracking-[0.2em] text-muted-foreground uppercase">
                  {loc.landmark}
                </p>
                {loc.phone && (
                  <a
                    href={loc.phoneHref}
                    className="mt-2 inline-block font-mono text-sm tracking-[0.08em] transition-colors hover:text-primary"
                  >
                    {loc.phone}
                  </a>
                )}
              </li>
            ))}
          </ol>

          {/* Hours — honest fallback: none published. */}
          <div className="mt-8">
            <span className="block font-mono text-[0.62rem] tracking-[0.28em] text-muted-foreground uppercase">
              Opening hours
            </span>
            {hasHours ? (
              <div className="mt-3 space-y-2">
                {restaurant.hours.map((h) => (
                  <div key={h.days} className="flex flex-wrap justify-between gap-2 max-w-sm">
                    <span className="text-muted-foreground">{h.days}</span>
                    <span>{h.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Not published yet —{" "}
                <a
                  href={restaurant.phoneHref}
                  className="text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
                >
                  call the restaurant
                </a>{" "}
                for today's timings.
              </p>
            )}
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            {restaurant.directions && (
              <a
                href={restaurant.directions}
                className="inline-flex items-center gap-2 border border-primary bg-primary px-7 py-3.5 text-[0.72rem] tracking-[0.2em] text-primary-foreground uppercase transition-colors hover:bg-transparent hover:text-primary"
              >
                <MapPin className="size-4" /> Get Directions
              </a>
            )}
            <a
              href={restaurant.phoneHref}
              className="inline-flex items-center gap-2 border border-border px-7 py-3.5 text-[0.72rem] tracking-[0.2em] uppercase transition-colors hover:border-primary/60 hover:text-primary"
            >
              <Phone className="size-4" /> Call Restaurant
            </a>
          </div>
        </Reveal>

        {/* Map panel — abstract street grid in the iron system */}
        <Reveal delay={100}>
          <div className="frame-inset relative h-[340px] w-full overflow-hidden border border-border bg-card sm:h-[480px] lg:h-full lg:min-h-[520px]">
            <div
              className="absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
                backgroundSize: "56px 56px",
              }}
            />
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(115deg, transparent 42%, var(--color-muted) 42%, var(--color-muted) 45%, transparent 45%), linear-gradient(25deg, transparent 60%, var(--color-muted) 60%, var(--color-muted) 62%, transparent 62%)",
              }}
            />
            <div className="grain absolute inset-0 opacity-[0.05]" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-full border border-primary/60 text-primary">
                  <MapPin className="size-5" />
                </span>
                <p className="mt-4 font-display text-2xl">{restaurant.city}</p>
                <p className="mt-1 font-mono text-[0.6rem] tracking-[0.24em] text-muted-foreground uppercase">
                  {locations.map((loc) => loc.label).join(" · ")}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
