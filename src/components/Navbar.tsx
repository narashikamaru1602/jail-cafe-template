import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { restaurant } from "@/data/restaurant";

const links = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
] as const;

// ----------------------------------------------------------------------------
// NAVBAR — iron bar navigation.
// Dark on every state (the old warm-cream bar is gone): transparent over the
// hero, then an opaque charcoal bar with a hairline iron edge once scrolled.
// The mobile menu is a full-width dark panel below the header (exact
// alignment via top-full) with cell-plate contact details at the bottom.
// ----------------------------------------------------------------------------
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Publish the live header height as `--nav-h` on <html> so every dependent
  // element (mobile panel max-height, /menu sticky filter offset) tracks the
  // real header instead of a magic number — the header height differs by
  // breakpoint and between the transparent/solid states.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const sync = () =>
      document.documentElement.style.setProperty(
        "--nav-h",
        `${Math.ceil(el.getBoundingClientRect().height)}px`,
      );
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Solid once the page scrolls (or the mobile panel is open) so links stay
  // legible against content passing underneath.
  const solid = scrolled || open;

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color,padding] duration-500 ${
        solid
          ? open
            ? // Fully opaque while the panel is open: nothing behind the
              // header may ghost through the open navigation.
              "border-b border-border bg-background py-3"
            : "border-b border-border bg-background/92 py-3 backdrop-blur-md"
          : "border-b border-transparent py-5"
      }`}
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 sm:px-8 lg:grid-cols-[1fr_auto_1fr]">
        {/* Wordmark */}
        <Link to="/" className="min-w-0">
          <span className="block truncate font-display text-base leading-none tracking-[0.16em] text-foreground uppercase transition-colors duration-500 sm:text-lg sm:tracking-[0.24em] lg:text-xl lg:tracking-[0.3em]">
            {restaurant.name}
          </span>
          <span className="mt-1.5 block h-px w-7 bg-primary transition-colors duration-500" />
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="link-underline text-[0.76rem] tracking-[0.18em] text-white/70 uppercase transition-colors duration-300 hover:text-primary data-[status=active]:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-3 sm:gap-4">
          <a
            href={restaurant.phoneHref}
            aria-label={`Call ${restaurant.name}`}
            className="hidden shrink-0 p-1 text-white/70 transition-colors hover:text-primary sm:block lg:hidden"
          >
            <Phone className="size-[18px]" />
          </a>
          <Link
            to="/contact"
            hash="reserve"
            className="hidden shrink-0 border border-primary px-5 py-2.5 text-[0.7rem] tracking-[0.18em] whitespace-nowrap text-primary uppercase transition-colors duration-300 hover:bg-primary hover:text-primary-foreground sm:inline-block sm:px-6"
          >
            Reserve a Table
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="shrink-0 p-1 text-foreground transition-colors duration-300 lg:hidden"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile panel — sits exactly below the header (top-full) and carries
          its own scroll if the viewport is short. */}
      {open && (
        <div className="absolute inset-x-0 top-full max-h-[calc(100svh-var(--nav-h))] overflow-y-auto border-b border-border bg-background lg:hidden">
          <div
            aria-hidden="true"
            className="bar-field-dense pointer-events-none absolute inset-0 opacity-40"
          />
          <div className="relative px-6 pt-8 pb-8 sm:px-8">
            <nav className="flex flex-col">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  activeOptions={{ exact: l.to === "/" }}
                  className="flex items-baseline justify-between border-b border-dotted border-border py-4 font-display text-3xl text-foreground/85 transition-colors data-[status=active]:text-primary"
                >
                  {l.label}
                  <span className="font-mono text-[0.58rem] tracking-[0.3em] text-muted-foreground uppercase">
                    {l.label === "Home" ? "00" : `0${links.indexOf(l)}`}
                  </span>
                </Link>
              ))}
            </nav>

            <Link
              to="/contact"
              hash="reserve"
              className="mt-8 block border border-primary bg-primary px-6 py-4 text-center text-[0.72rem] tracking-[0.22em] text-primary-foreground uppercase transition-colors hover:bg-transparent hover:text-primary"
            >
              Reserve a Table
            </Link>

            <div className="mt-7 grid gap-3">
              <span className="cell-plate-steel w-fit">{restaurant.city}</span>
              <a
                href={restaurant.phoneHref}
                className="w-fit font-mono text-sm tracking-[0.14em] text-foreground transition-colors hover:text-primary"
              >
                {restaurant.phone}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
