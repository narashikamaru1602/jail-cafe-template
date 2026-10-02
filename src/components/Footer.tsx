import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Phone } from "lucide-react";
import { locations, restaurant } from "@/data/restaurant";

// ----------------------------------------------------------------------------
// FOOTER — dark iron close to the page (the warm-cream footer is gone).
// Gate-rail boundary on top, three columns: brand / explore / visit, then a
// hairline bottom bar. Social icons only render when a handle URL is set
// (none ship with the template — see restaurant.ts).
// ----------------------------------------------------------------------------
export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-iron">
      <div aria-hidden="true" className="bar-rail" />
      <div aria-hidden="true" className="bar-field absolute inset-0 opacity-25" />

      <div className="relative mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10 lg:gap-16">
          <div>
            <span className="font-display text-2xl tracking-[0.18em] text-foreground uppercase">
              {restaurant.name}
            </span>
            <span className="mt-2 block h-px w-8 bg-primary" />
            <p className="mt-5 max-w-xs font-display text-xl text-muted-foreground italic">
              {restaurant.tagline}
            </p>
            <a
              href={restaurant.phoneHref}
              className="mt-6 inline-flex items-center gap-2 font-mono text-sm tracking-[0.1em] transition-colors hover:text-primary"
            >
              <Phone className="size-3.5 text-primary" /> {restaurant.phone}
            </a>
            {(restaurant.instagram || restaurant.facebook) && (
              <div className="mt-7 flex gap-3">
                {restaurant.instagram && (
                  <a
                    href={restaurant.instagram}
                    aria-label="Instagram"
                    className="border border-border p-2.5 transition-colors hover:border-primary hover:text-primary"
                  >
                    <Instagram className="size-4" />
                  </a>
                )}
                {restaurant.facebook && (
                  <a
                    href={restaurant.facebook}
                    aria-label="Facebook"
                    className="border border-border p-2.5 transition-colors hover:border-primary hover:text-primary"
                  >
                    <Facebook className="size-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          <nav className="flex flex-col gap-3 text-sm">
            <span className="cell-plate mb-2 w-fit">Explore</span>
            <Link
              to="/"
              className="w-fit text-muted-foreground transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link
              to="/menu"
              className="w-fit text-muted-foreground transition-colors hover:text-primary"
            >
              Menu
            </Link>
            <Link
              to="/gallery"
              className="w-fit text-muted-foreground transition-colors hover:text-primary"
            >
              Gallery
            </Link>
            <Link
              to="/contact"
              className="w-fit text-muted-foreground transition-colors hover:text-primary"
            >
              Contact
            </Link>
          </nav>

          <div className="flex flex-col gap-3 text-sm">
            <span className="cell-plate mb-2 w-fit">Visit</span>
            <p className="max-w-[17rem] text-muted-foreground">{restaurant.address}</p>
            <p className="font-mono text-[0.6rem] tracking-[0.2em] text-muted-foreground uppercase">
              {locations.map((loc) => loc.label).join(" · ")}
            </p>
            <p className="text-muted-foreground">
              Hours — {restaurant.hours[0]?.time ?? "[OPENING HOURS]"}
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[0.62rem] tracking-[0.16em] text-muted-foreground uppercase">
            © 2026 {restaurant.name}. All rights reserved.
          </p>
          <p className="font-mono text-[0.62rem] tracking-[0.24em] text-muted-foreground uppercase">
            {restaurant.city}
          </p>
        </div>
      </div>
    </footer>
  );
}
