import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { menu, menuCategories, menuItemImage, seo } from "@/data/restaurant";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";

const { title, description } = seo.pages.menu;

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const [active, setActive] = useState<string>("All");
  const categories = ["All", ...menuCategories];
  const shown = active === "All" ? [...menuCategories] : [active];

  return (
    <>
      <PageHeader
        eyebrow="The Menu"
        title="Fire, spice, restraint."
        subtitle="Placeholder items and prices in INR."
      />

      <div className="sticky top-[var(--nav-h)] z-30 border-y border-border bg-background/92 backdrop-blur-md">
        <div className="mx-auto max-w-[1400px] overflow-x-auto px-5 sm:px-8">
          <div className="flex min-w-max gap-7 py-4">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActive(c)}
                className={`text-[0.7rem] tracking-[0.2em] whitespace-nowrap uppercase transition-colors ${
                  active === c ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 pt-16 pb-28 sm:px-8">
        {shown.map((category) => (
          <section key={category} className="mb-20 last:mb-0">
            <Reveal>
              <div className="flex items-end gap-6">
                <h2 className="font-display text-3xl sm:text-4xl">{category}</h2>
                <span className="mb-2 h-px flex-1 bg-border" />
              </div>
            </Reveal>

            <div className="mt-10 grid gap-x-16 gap-y-9 lg:grid-cols-2">
              {(menu[category] ?? []).map((item, i) => {
                const image = menuItemImage(category, item.name);
                return (
                  <Reveal key={item.name} delay={(i % 2) * 60}>
                    <article className="group">
                      <div className="relative mb-5 aspect-[4/3] overflow-hidden border border-border bg-muted/20">
                        <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
                          <span className="text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">
                            Photo coming soon
                          </span>
                        </div>
                        {image && (
                          <img
                            src={image}
                            alt={item.name}
                            loading="lazy"
                            width={800}
                            height={600}
                            className="relative z-10 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                      </div>

                      <div className="flex items-baseline gap-4">
                        <h3 className="font-display text-xl text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                          {item.name}
                        </h3>
                        {item.veg && (
                          <span
                            aria-label="Vegetarian"
                            title="Vegetarian"
                            className="mb-0.5 inline-block size-2 shrink-0 rounded-full bg-sage"
                          />
                        )}
                        <span className="mx-1 mb-1.5 hidden h-px flex-1 border-b border-dotted border-border sm:block" />
                        <span className="ml-auto shrink-0 text-sm text-primary sm:ml-0">
                          {item.price}
                        </span>
                      </div>
                      {item.description && (
                        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </section>
        ))}

        <p className="mt-4 flex items-center gap-3 border-t border-border pt-8 text-xs tracking-[0.16em] text-muted-foreground uppercase">
          <span className="inline-block size-2 rounded-full bg-sage" /> Vegetarian
        </p>
      </div>
    </>
  );
}
