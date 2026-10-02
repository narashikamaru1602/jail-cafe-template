// ============================================================================
// RESTAURANT DATA — PLACEHOLDER TEMPLATE DATA
// ============================================================================
// This file is the single source of truth for all restaurant-specific
// content consumed by routes/components (Navbar, Footer, Hero,
// SignatureDishes, ExperienceSection, ContactSection, ReservationSection,
// GallerySection, menu.tsx).
//
// This repository ships as a GENERIC jail-themed café website template.
// Every value below is a clearly-marked placeholder — [ADDRESS], [PHONE],
// [CITY], ITEM 01, ₹XXX, CATEGORY 01, and so on. Replace the bracketed
// values with your own restaurant's details before publishing. Do not
// commit real contact details, addresses, prices or ratings until they are
// meant to be public, and never invent facts.
// ============================================================================

// NOTE: The image below is a generic, unbranded food photograph carried over
// from an earlier demo project. It identifies no restaurant and is labeled
// honestly as pending wherever it appears. The story and gallery
// photography has been removed entirely: the gallery is presented as an
// intentional "coming soon" state (src/components/GalleryComingSoon.tsx)
// rather than with placeholder imagery.
import dishPaneer from "@/assets/dish-paneer.jpg";

// Phone entries as displayed. `verifiedActive` is always false here because
// the template ships no phone number that has been confirmed in service —
// replace these with your restaurant's real, verified numbers.
export type RestaurantPhone = {
  number: string;
  href: string;
  verifiedActive: false;
};

const phones: RestaurantPhone[] = [{ number: "[PHONE]", href: "tel:", verifiedActive: false }];

// ----------------------------------------------------------------------------
// Branches — placeholder records. The first entry is the primary branch; its
// address/phone feed the fields below for backward compatibility with
// existing consumers. Add, remove or edit entries to match your own venue.
// ----------------------------------------------------------------------------
export type Location = {
  label: string;
  address: string;
  landmark: string;
  phone: string;
  phoneHref: string;
  /** Status shown on the plate — replace with your own wording. */
  status: string;
};

export const locations: Location[] = [
  {
    label: "[LOCATION 01]",
    address: "[ADDRESS]",
    landmark: "[LANDMARK]",
    phone: phones[0]!.number,
    phoneHref: phones[0]!.href,
    status: "[STATUS]",
  },
  {
    label: "[LOCATION 02]",
    address: "[ADDRESS]",
    landmark: "[LANDMARK]",
    phone: phones[0]!.number,
    phoneHref: phones[0]!.href,
    status: "[STATUS]",
  },
  {
    label: "[LOCATION 03]",
    address: "[ADDRESS]",
    landmark: "[LANDMARK]",
    phone: "",
    phoneHref: "",
    status: "[STATUS]",
  },
];

export const restaurant = {
  // Placeholder identity for the template. Replace with your restaurant's
  // name — this value drives the navbar, hero, footer and metadata.
  name: "CELLHOUSE",

  tagline: "[TAGLINE]",

  description: "[RESTAURANT DESCRIPTION]",

  cuisine: "[CUISINE]",

  address: "[ADDRESS]",
  city: "[CITY]",

  phones,
  phone: phones[0]!.number,
  phoneHref: phones[0]!.href,

  // Set to your restaurant's published email address to show it
  // (reservations/contact hide the row while empty).
  email: "[EMAIL]",

  // Opening hours. Replace the placeholder row with your own schedule, or
  // leave the array empty to make the contact section fall back to a
  // "call for timings" prompt.
  hours: [{ days: "[DAYS]", time: "[OPENING HOURS]" }] as {
    days: string;
    time: string;
  }[],

  // No social accounts ship with the template. `instagramHandle` is a
  // display placeholder; `instagram` / `facebook` are the clickable URLs —
  // leave them empty and the footer hides the social row, or set them to
  // your own profile URLs.
  instagramHandle: "[INSTAGRAM]",
  instagram: "",
  facebook: "",

  // No map link ships with the template. Leave empty and the contact page
  // hides the "Get Directions" button, or set it to your own maps URL.
  directions: "",

  priceForTwo: "",
};

// ----------------------------------------------------------------------------
// SEO — single source for <head> metadata in __root.tsx / routes/*.tsx.
// Generic template values; replace with your own restaurant's details.
// ----------------------------------------------------------------------------
export const seo = {
  siteName: "CELLHOUSE",
  defaultTitle: "CELLHOUSE — Cinematic Jail Café Experience",
  defaultDescription:
    "A cinematic jail-themed café website template with a 3D gate intro, cell-block sections and placeholder content.",
  pages: {
    home: {
      title: "CELLHOUSE — Cinematic Jail Café Experience",
      description:
        "A cinematic jail-themed café website template — 3D gate intro, cell-block dining sections and placeholder content throughout.",
    },
    menu: {
      title: "Menu | CELLHOUSE",
      description:
        "Browse the placeholder menu — categories, items and prices ready to be replaced with your own.",
    },
    gallery: {
      title: "Gallery | CELLHOUSE",
      description: "Photography for CELLHOUSE is coming soon.",
    },
    contact: {
      title: "Contact | CELLHOUSE",
      description:
        "Placeholder address, phone number and directions — replace them with your restaurant's details.",
    },
  },
};

// ----------------------------------------------------------------------------
// Signature dishes — homepage "02 · SIGNATURE" section.
// Placeholder rows: same count as before so the layout is unchanged. Replace
// the names and prices with your own signature dishes.
// ----------------------------------------------------------------------------
export type SignatureDish = {
  name: string;
  price?: string;
};

export const signatureDishes: SignatureDish[] = [
  { name: "ITEM 01", price: "₹XXX" },
  { name: "ITEM 02", price: "₹XXX" },
  { name: "ITEM 03", price: "₹XXX" },
  { name: "ITEM 04", price: "₹XXX" },
  { name: "ITEM 05", price: "₹XXX" },
  { name: "ITEM 06", price: "₹XXX" },
];

/** Section photograph slot — generic unbranded placeholder (see header note). */
export const signatureImage = dishPaneer;
/** Honest alt text for the placeholder above. */
export const signatureImageAlt = "Placeholder — food photo pending";

// ----------------------------------------------------------------------------
// Menu — placeholder items with the same category and item counts as the
// original layout, so filtering, grids and cards behave identically. Replace
// category names, item names and prices (`₹XXX`) with your own menu.
// Items with no price keep `price: undefined` rather than a guess.
// ----------------------------------------------------------------------------
export type MenuItem = {
  name: string;
  description?: string;
  price?: string;
  veg?: boolean;
};

export const menuCategories = [
  "CATEGORY 01",
  "CATEGORY 02",
  "CATEGORY 03",
  "CATEGORY 04",
  "CATEGORY 05",
  "CATEGORY 06",
  "CATEGORY 07",
  "CATEGORY 08",
  "CATEGORY 09",
] as const;

const priced = (name: string): MenuItem => ({
  name,
  price: "₹XXX",
  veg: true,
});

const unpriced = (name: string): MenuItem => ({ name, veg: true });

export const menu: Record<string, MenuItem[]> = {
  "CATEGORY 01": [
    priced("ITEM 01"),
    priced("ITEM 02"),
    priced("ITEM 03"),
    unpriced("ITEM 04"),
    unpriced("ITEM 05"),
    priced("ITEM 06"),
  ],
  "CATEGORY 02": [priced("ITEM 01"), priced("ITEM 02"), priced("ITEM 03"), priced("ITEM 04")],
  "CATEGORY 03": [priced("ITEM 01"), priced("ITEM 02"), priced("ITEM 03")],
  "CATEGORY 04": [priced("ITEM 01"), priced("ITEM 02"), priced("ITEM 03"), priced("ITEM 04")],
  "CATEGORY 05": [priced("ITEM 01"), unpriced("ITEM 02")],
  "CATEGORY 06": [
    priced("ITEM 01"),
    priced("ITEM 02"),
    priced("ITEM 03"),
    priced("ITEM 04"),
    priced("ITEM 05"),
    priced("ITEM 06"),
    priced("ITEM 07"),
    priced("ITEM 08"),
  ],
  "CATEGORY 07": [priced("ITEM 01"), priced("ITEM 02"), priced("ITEM 03")],
  "CATEGORY 08": [unpriced("ITEM 01"), unpriced("ITEM 02")],
  "CATEGORY 09": [
    priced("ITEM 01"),
    priced("ITEM 02"),
    priced("ITEM 03"),
    unpriced("ITEM 04"),
    unpriced("ITEM 05"),
  ],
};

// Menu photography slots. Upload a real photo to
// `public/menu-images/<category>/<slug>.jpg` AND add that exact relative path
// to `menuImageManifest` below. The site only ever requests files listed in
// the manifest, so a missing file can never fire a 404 — until a photo is
// both uploaded and listed, the menu shows an intentionally empty photo frame
// with "Photo coming soon" rather than unrelated placeholder photography.
const menuImageManifest = new Set<string>([
  // e.g. "category-01/item-01.jpg",
]);

export function menuItemImage(category: string, name: string): string | null {
  const slug = (value: string) =>
    value
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const key = `${slug(category)}/${slug(name)}.jpg`;
  return menuImageManifest.has(key) ? `/menu-images/${key}` : null;
}

// ----------------------------------------------------------------------------
// Guest ratings — placeholder plates: score · source · count. Replace with
// your restaurant's real published platform ratings. Reviews must never be
// fabricated; the UI renders these plates instead of testimonial quotes.
// ----------------------------------------------------------------------------
export type Rating = {
  source: string;
  scope: string;
  score: string;
  count: string;
};

export const ratings: Rating[] = [
  { source: "[PLATFORM 01]", scope: "[CITY]", score: "X.X", count: "[RATING COUNT]" },
  { source: "[PLATFORM 02]", scope: "[CITY]", score: "X.X", count: "[RATING COUNT]" },
  { source: "[PLATFORM 03]", scope: "[CITY]", score: "X.X", count: "[RATING COUNT]" },
];

// ----------------------------------------------------------------------------
// Testimonials — intentionally EMPTY.
// No testimonials with permission to reproduce exist for a template. Per
// project rules, testimonials must not be fabricated. The UI renders
// `ratings` above instead. Populate this array only with real reviews the
// business has approved for use.
// ----------------------------------------------------------------------------
export type Testimonial = {
  name: string;
  review: string;
  rating: number;
};

export const testimonials: Testimonial[] = [];
