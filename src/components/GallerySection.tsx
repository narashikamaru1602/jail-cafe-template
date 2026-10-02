import { GalleryComingSoon } from "./GalleryComingSoon";
import { SectionHeading } from "./SectionHeading";

// ----------------------------------------------------------------------------
// GALLERY — homepage teaser, now an intentional COMING SOON presentation.
// The grid + lightbox are gone (placeholder photography removed); the shared
// GalleryComingSoon frame carries the section so there is no empty gap.
// ----------------------------------------------------------------------------
export function GallerySection() {
  return (
    <section className="relative border-t border-border">
      <div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:py-32">
        <SectionHeading
          eyebrow="The Gallery"
          title="Coming soon"
          subtitle="Cells, props and plates — the photographs are on their way."
        />

        <div className="mt-14 lg:mt-16">
          <GalleryComingSoon />
        </div>
      </div>
    </section>
  );
}
