# Attribution & Licensing Notes

The cinematic 3D system in `src/3d/` and `src/audio/` was written from
scratch for this project. Reference repositories under `Repos/` were studied
for TECHNIQUES only — no files, assets, textures or audio were copied from
them unless their license explicitly permitted it.

## Libraries used (runtime)

| Package             | License | Notes                                        |
| ------------------- | ------- | -------------------------------------------- |
| react / react-dom   | MIT     |                                              |
| three               | MIT     | core renderer + examples/jsm (GLTFLoader)    |
| @react-three/fiber  | MIT     | React renderer                               |
| @react-three/drei   | MIT     | `AdaptiveDpr` + `Preload` only               |
| @tanstack/react-*   | MIT     | router/SSR shell                             |
| gsap                | (removed) | no longer used — the intro is delta-driven |

## Reference repositories — how each was used

| Repo                                       | License status                     | What we took                                                                                     |
| ------------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| `CinematicIntros-JSX`                      | Apache-2.0 (README badge says MIT) | CONCEPTS only: shot sequencing, easing tables, CatmullRom paths, FOV lerp. Reimplemented in `src/3d/cinematic/`. The per-frame `setProgress` React pattern was deliberately NOT copied (it violates the one-clock/no-state-per-frame contract). |
| `threejs-procedural-dungeon`               | MIT (© Majid Manzarpour)          | CONCEPTS only: InstancedMesh discipline, DPR clamping, light budgets, canvas/procedural textures, dispose discipline. No random dungeon generation — our corridor is authored. |
| `3d-model-web-page`                        | NO LICENSE FOUND                   | CONCEPT only: bounding-box door hinge (`doorPivotSetup`) → reimplemented as `src/3d/gate/hinge.ts`. No code copied. |
| `DoorSection.jsx`                          | NO LICENSE FOUND                   | CONCEPTS only: outer-edge hinges, mirrored left/right rotation, lazy mount + ready signal + fallback timeout, handle-before-door choreography, touch guards. Reimplemented. |
| Restaurant demo repos under `Repos/`       | various / unknown                  | Stylistic inspiration only (menu/gallery section patterns already existed in the skeleton). No code copied. |

> Note: the `three.js-train` reference repository is **not used** — the food
> train was removed from the concept entirely and no code, assets or
> techniques from that repo remain in this project.

## Assets

- **3D geometry**: 100% procedural/authored in code (`JailGate`,
  `CellBlock`, corridor shell). No external models.
- **Textures**: none — materials are flat PBR colours from
  `src/3d/prison/PrisonMaterials.ts`.
- **Audio**: `src/audio/audioConfig.ts` ships every clip as `null`. No audio
  has been downloaded or invented. Add files ONLY when provenance and
  licensing are documented here:

  | Clip         | File | Source | License |
  | ------------ | ---- | ------ | ------- |
  | gateUnlock   | —    | —      | —       |
  | gateOpen     | —    | —      | —       |
  | ambience     | —    | —      | —       |

## Protected files (architecture contract)

The skeleton's routes, Firebase config, prerender/SPA shell, website
sections and styles were kept behavior-neutral apart from two type fixes
(see `restaurant.ts` non-null assertions and the `vite.config.ts`
`failOnError` removal — the installed TanStack version defaults that option
to `true`). Restaurant-specific content has since been replaced with
generic placeholder data (see README).
