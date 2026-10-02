import { createFileRoute } from "@tanstack/react-router";
import { ContactSection } from "@/components/ContactSection";
import { ReservationSection } from "@/components/ReservationSection";
import { PageHeader } from "@/components/PageHeader";
import { restaurant, seo } from "@/data/restaurant";

const { title, description } = seo.pages.contact;

export const Route = createFileRoute("/contact")({
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
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Come sit with us."
        subtitle={`${restaurant.city} · ${restaurant.cuisine}`}
      />
      <ReservationSection />
      <ContactSection />
    </>
  );
}
