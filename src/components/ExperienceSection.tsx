import { Armchair, Camera, Unlock, UtensilsCrossed } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

// ----------------------------------------------------------------------------
// EXPERIENCE — the jail theme itself, as four framed "cell" panels.
// Bar-rail boundary on top, faint rod field behind, riveted iron panels in
// front: this section is the clearest statement of the prison-UI system.
// Cells 01–02 describe the jail theme itself; cells 03–04 ship as
// clearly-marked placeholder copy — edit the CELLS array below.
// ----------------------------------------------------------------------------
const CELLS = [
  {
    no: "01",
    Icon: Armchair,
    title: "Cell-block seating",
    body: "Tables sit inside structured metal enclosures built like prison cells — vertical iron bars, cell numbers on the doors and low-lit ambient light.",
  },
  {
    no: "02",
    Icon: Camera,
    title: "Mugshot props",
    body: "Handcuffs, police hats and slate boards are kept ready for guests who want their own prisoner portrait inside the cell.",
  },
  {
    no: "03",
    Icon: UtensilsCrossed,
    title: "[CUISINE]",
    body: "[CUISINE DESCRIPTION]",
  },
  {
    no: "04",
    Icon: Unlock,
    title: "[EXPERIENCE]",
    body: "[EXPERIENCE DESCRIPTION]",
  },
];

export function ExperienceSection() {
  return (
    <section className="relative overflow-hidden border-t border-border bg-secondary/30">
      {/* gate-rail boundary */}
      <div aria-hidden="true" className="bar-rail" />
      <div aria-hidden="true" className="bar-field absolute inset-0 opacity-45" />

      <div className="relative mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:py-28">
        <SectionHeading
          eyebrow="The Experience"
          title="Inside the block"
          subtitle="The jail isn't decoration — it's the dining room."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-6">
          {CELLS.map(({ no, Icon, title, body }, i) => (
            <Reveal key={no} delay={i * 90}>
              <article className="iron-panel rivets relative h-full p-6 pt-6 sm:p-7">
                <div className="flex items-start justify-between">
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                  <span className="font-mono text-[0.6rem] tracking-[0.28em] text-muted-foreground uppercase">
                    Cell {no}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-2xl leading-tight">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
