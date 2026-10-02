// ============================================================================
// ASSET MANIFEST — declared assets for the intro (currently procedural).
// ----------------------------------------------------------------------------s
// The cinematic is fully procedural (authored geometry + shared materials),
// so the manifest ships EMPTY — but the loading architecture around it is
// real: preloadAssets() walks this list, resolves when everything is in
// memory, and is bounded by ASSET_TIMEOUT_MS so a slow/failed asset can never
// trap a visitor behind the intro.
//
// Drop future GLB/texture entries here and they are picked up automatically
// by the preload pass (GLTFLoader is dynamically imported only when a model
// entry exists, keeping it out of the initial bundle graph).
// ============================================================================

export type AssetKind = "model" | "texture";

export interface AssetDescriptor {
  readonly id: string;
  readonly kind: AssetKind;
  /** URL relative to the public root (or an absolute URL). */
  readonly url: string;
}

/** Reserved for authored assets — nothing external is required today. */
export const ASSET_MANIFEST: readonly AssetDescriptor[] = [];

/** Hard cap on the preload pass (ms). On expiry we proceed without assets. */
export const ASSET_TIMEOUT_MS = 6000;

export function hasAssets(): boolean {
  return ASSET_MANIFEST.length > 0;
}
