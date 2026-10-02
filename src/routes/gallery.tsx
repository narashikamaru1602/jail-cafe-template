import { createFileRoute } from "@tanstack/react-router";
import { GalleryComingSoon } from "@/components/GalleryComingSoon";
import { PageHeader } from "@/components/PageHeader";
import { restaurant, seo } from "@/data/restaurant";

const { title, description } = seo.pages.gallery;

export const Route = createFileRoute("/gallery")({
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
  component: GalleryPage,
});

function GalleryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="Coming soon"
        subtitle={`Photography of ${restaurant.name} is being prepared.`}
      />
      <div className="mx-auto max-w-[1400px] px-5 pb-28 sm:px-8">
        <GalleryComingSoon />
      </div>
    </>
  );
}
