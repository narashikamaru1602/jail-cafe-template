# Menu photos

Upload real dish photos here, then list each photo in the manifest so the
menu page requests it. Until a photo is both uploaded **and** listed, the
menu shows an intentionally empty frame with "Photo coming soon" — the site
never requests files that don't exist (no 404s).

Folder/file pattern:

`public/menu-images/<category-slug>/<item-slug>.jpg`

Examples (matching the placeholder menu):

- `public/menu-images/category-01/item-01.jpg`
- `public/menu-images/category-06/item-01.jpg`
- `public/menu-images/category-09/item-03.jpg`

The slug is lowercase, spaces become hyphens, `&` becomes "and", and
punctuation is removed.

Then register the file (relative to `public/menu-images/`) in
`menuImageManifest` inside `src/data/restaurant.ts`:

```ts
const menuImageManifest = new Set<string>([
  "category-01/item-01.jpg",
]);
```

Only keep photos you own or are licensed to use; do not use unrelated stock
photos.
