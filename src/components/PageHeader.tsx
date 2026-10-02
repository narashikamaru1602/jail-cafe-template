export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative mx-auto max-w-[1400px] px-5 pt-36 pb-16 sm:px-8 sm:pt-44 sm:pb-20">
      <span className="cell-plate">{eyebrow}</span>
      <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[1.02] text-balance sm:text-7xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-6 max-w-lg text-[0.95rem] leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
      )}
      <div className="iron-rule mt-10" />
    </section>
  );
}
