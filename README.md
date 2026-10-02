# CELLHOUSE — jail-themed café website template

A reusable, cinematic jail-themed café/restaurant website template: a 3D
jail-gate intro hands off to a dark, iron-and-brass homepage with menu,
gallery (coming soon) and contact routes.

> **Placeholder content:** every restaurant-specific detail (name, addresses,
> phones, hours, menu categories/items, prices, ratings, SEO copy) ships as
> a clearly-marked placeholder in `src/data/restaurant.ts` — `[ADDRESS]`,
> `[PHONE]`, `[CITY]`, `ITEM 01`, `₹XXX`, `CATEGORY 01`, and so on. Replace
> them with your own restaurant's details before publishing. **Never invent
> restaurant facts.**

> **Licensing:** see `ATTRIBUTION.md` for the licensing/attribution status
> of every library, reference repository and asset used by the project.

## Stack

- **TanStack Start** (file-based router, React 19, Vite 8) with SPA-mode
  prerendering — `vite.config.ts`
- Every route is prerendered at build time:
  `dist/client/index.html` (homepage, real markup: `<h1>` "YOUR CELL AWAITS",
  all sections, footer), `menu/`, `gallery/`, `contact/`, plus
  `_shell.html` (the SPA fallback targeted by the Firebase rewrite).
- **three.js / @react-three/fiber** for the intro — lazy-loaded, quality-tier
  aware, with a 7-second safety timeout and reduced-motion handling.
- **Firebase Hosting** (`firebase.json` / `.firebaserc`) for deployment.
- Styling: Tailwind CSS v4 + `src/styles.css` (design tokens + the iron/bar
  utility system: `cell-plate`, `bar-field`, `iron-panel`, `rivets`,
  `frame-inset`, `iron-rule`, `grain`, …).

## Commands

```bash
npm run dev          # local dev server
npx tsc --noEmit     # typecheck (run before claiming a change works)
npm run lint         # eslint
npm run build        # vite build → dist/client + dist/server
npm run preview      # serve the production build
npm run firebase:deploy
```

Note: `npm run build` does **not** typecheck — always run
`npx tsc --noEmit` separately.

## Architecture notes

- **Intro:** `src/intro/` — `ShotPlayer`, `CameraRig`, `IntroController`,
  `IntroExperience`. It renders an opaque overlay above the fully rendered
  homepage; the overlay leaves via a CSS-only handoff (`IntroHandoff`,
  driven by `INTRO_EXIT_EVENT`). While the overlay is opaque the page
  beneath is `inert` + `aria-hidden` so nothing behind it is tabbable.
- **Homepage order:** Hero → signature food → experience → menu
  CTA → gallery (coming soon) → location/contact → footer
  (`src/routes/index.tsx`).
- **Data:** `src/data/restaurant.ts` only — every placeholder lives there.
  Empty fields (social links, map link) hide their UI, and absent hours
  render a fallback instead of invented content.
- **Menu photos:** the site only requests files listed in
  `menuImageManifest` (see `src/data/restaurant.ts`); unlisted photos never
  fire a 404 — the frame shows "Photo coming soon".

## Verification checklist

Any non-trivial change should pass all of:

1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build`
4. Inspect `dist/client/index.html` — contains `<h1>` and real homepage
   content; `dist/client/_shell.html` still exists as the SPA fallback.
5. Visual check of `/`, `/menu`, `/gallery`, `/contact` at
   360–430px widths and desktop.
6. No new console errors or 404s.
