import { Reveal } from "./Reveal";

// ----------------------------------------------------------------------------
// SECTION HEADING — shared header block for the prison-UI system:
// cell-plate eyebrow → display heading → optional muted subtitle.
// ----------------------------------------------------------------------------
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal className={align === "center" ? "text-center" : ""}>
      {eyebrow && <span className="cell-plate">{eyebrow}</span>}
      <h2 className="mt-5 font-display text-4xl leading-[1.1] text-balance sm:text-5xl">{title}</h2>
      {subtitle && (
        <p
          className={`mt-4 max-w-xl text-[0.95rem] text-muted-foreground ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
