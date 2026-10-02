import { createFileRoute } from "@tanstack/react-router";
import { IntroExperience } from "@/intro/IntroExperience";
import { IntroHandoff } from "@/components/IntroHandoff";
import { Hero } from "@/components/Hero";
import { SignatureDishes } from "@/components/SignatureDishes";
import { ExperienceSection } from "@/components/ExperienceSection";
import { MenuBanner } from "@/components/MenuBanner";
import { GallerySection } from "@/components/GallerySection";
import { Testimonials } from "@/components/Testimonials";
import { ReservationSection } from "@/components/ReservationSection";
import { ContactSection } from "@/components/ContactSection";
import { seo } from "@/data/restaurant";

const { title, description } = seo.pages.home;

export const Route = createFileRoute("/")({
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
  component: Index,
});

// Homepage order: cinematic gate overlay (+ its light handoff) → hero
// "Your cell awaits" → signature → experience → menu CTA → gallery (coming
// soon) → ratings → reservations → locations.
function Index() {
  return (
    <>
      {/* Sprint 1: jail-door opening sequence. Fixed-position overlay that
          covers the navbar + hero until the sequence finishes or is
          skipped; see src/intro/IntroExperience.tsx. */}
      <IntroExperience />
      {/* Cinematic → UI light transition played as that overlay exits. */}
      <IntroHandoff />
      <Hero />
      <SignatureDishes />
      <ExperienceSection />
      <MenuBanner />
      <GallerySection />
      <Testimonials />
      <ReservationSection />
      <ContactSection />
    </>
  );
}
