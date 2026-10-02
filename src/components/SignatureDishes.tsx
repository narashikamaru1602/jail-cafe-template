import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { restaurant, signatureDishes, signatureImage, signatureImageAlt } from "@/data/restaurant";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

// ----------------------------------------------------------------------------
// SIGNATURE DISHES — editorial record sheet rather than a generic card grid.
// Left: numbered hairline rows (index · dish · price), the way a charge
// sheet reads. Right: one large framed photograph with the same bar-veiled
// cell treatment as the story image. Rows are placeholder entries
// (ITEM 01 · ₹XXX) from restaurant.ts; the photograph is generic and
// unbranded, labeled "Photography pending".
// ----------------------------------------------------------------------------
export function SignatureDishes() {
  return (
    <section className="relative border-t border-border">
      <div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:py-32">
        <SectionHeading
          align="left"
          eyebrow="Signature"
          title={`A taste of ${restaurant.name}`}
          subtitle="Signature plates, ready for your own menu."
        />

        <div className="mt-14 grid gap-12 lg:mt-16 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          {/* Record rows */}
          <Reveal>
            <ol className="border-t border-border">
              {signatureDishes.map((dish, i) => (
                <li
                  key={dish.name}
                  className="group -mx-3 grid grid-cols-[2.2rem_1fr_auto] items-baseline gap-3 border-b border-border px-3 py-5 transition-colors duration-300 hover:bg-secondary/50 sm:py-6"
                >
                  <span className="font-mono text-[0.62rem] tracking-[0.18em] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-2xl leading-tight transition-colors duration-300 group-hover:text-primary sm:text-[1.7rem]">
                    {dish.name}
                  </h3>
                  <span className="font-mono text-sm tracking-[0.06em] text-primary">
                    {dish.price}
                  </span>
                </li>
              ))}
            </ol>

            <Link
              to="/menu"
              className="link-underline mt-9 inline-flex items-center gap-3 text-[0.75rem] tracking-[0.22em] text-primary uppercase"
            >
              View Full Menu <ArrowRight className="size-4" />
            </Link>
          </Reveal>

          {/* Framed photograph */}
          <Reveal delay={120}>
            <figure className="frame-inset rivets relative h-full min-h-[340px] overflow-hidden border border-border">
              <img
                src={signatureImage}
                alt={signatureImageAlt}
                loading="lazy"
                width={1024}
                height={1280}
                className="h-full w-full object-cover brightness-[0.72] saturate-[0.85] sm:min-h-[460px]"
              />
              <div aria-hidden="true" className="bar-field-dense absolute inset-0 opacity-40" />
              <figcaption className="absolute right-4 bottom-4 z-10">
                {/* Honest caption: this is stock placeholder photography, not
                    a photo of the restaurant's kitchen. */}
                <span className="cell-plate-steel bg-background/88 backdrop-blur-sm">
                  Photography pending
                </span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
