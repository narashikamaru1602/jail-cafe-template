import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { restaurant } from "@/data/restaurant";
import { Reveal } from "./Reveal";

// ----------------------------------------------------------------------------
// GALLERY COMING SOON — the intentional empty state for the gallery.
// The placeholder gallery photography has been removed on purpose: this
// riveted, bar-veiled frame presents the gallery as a deliberate "coming
// soon" feature of the site instead of an unfinished page. No stock and no
// generated imagery is shown — the frame itself is the presentation.
// ----------------------------------------------------------------------------
export function GalleryComingSoon() {
  return (
    <Reveal>
      <div className="iron-panel rivets relative overflow-hidden">
        <div aria-hidden="true" className="bar-field absolute inset-0 opacity-30" />
        <div className="frame-inset relative flex min-h-[340px] flex-col items-center justify-center px-6 py-16 text-center sm:min-h-[420px] sm:px-10">
          <span className="cell-plate-steel">Photography forthcoming</span>
          <div className="iron-rule mt-7 w-full max-w-sm" />
          <p className="mt-7 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
            This frame is reserved for real photographs of {restaurant.name} — the cells, the block
            and the plates. Nothing stock, nothing borrowed: the room itself, once it has been shot
            properly.
          </p>
          <Link
            to="/menu"
            className="link-underline mt-8 inline-flex items-center gap-3 text-[0.75rem] tracking-[0.22em] text-primary uppercase"
          >
            Read the menu instead <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </Reveal>
  );
}
