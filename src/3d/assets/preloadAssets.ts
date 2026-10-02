// ============================================================================
// PRELOAD ASSETS — bounded, failure-tolerant preload pass for the intro.
// ----------------------------------------------------------------------------s
// Contract:
//   * resolves even if assets fail (failures are reported, never thrown)
//   * resolves within ASSET_TIMEOUT_MS even on a stalled network
//   * caches in-flight work so calling twice is free
//   * dynamic-imports GLTFLoader only when a model entry actually exists
//
// The website must still load if the cinematic cannot — so the caller (which
// also waits for a first rendered frame) has its own fallback timeout too.
// ============================================================================

import * as THREE from "three";
import { ASSET_MANIFEST, ASSET_TIMEOUT_MS, type AssetDescriptor } from "./assetManifest";

export interface PreloadResult {
  readonly ok: boolean;
  readonly timedOut: boolean;
  readonly failed: readonly string[];
}

const cache = new Map<string, unknown>();
let inflight: Promise<PreloadResult> | null = null;

async function loadOne(asset: AssetDescriptor): Promise<void> {
  if (cache.has(asset.id)) return;
  if (asset.kind === "texture") {
    const loader = new THREE.TextureLoader();
    const texture = await loader.loadAsync(asset.url);
    texture.colorSpace = THREE.SRGBColorSpace;
    cache.set(asset.id, texture);
    return;
  }
  const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(asset.url);
  cache.set(asset.id, gltf);
}

function withTimeout(ms: number): Promise<null> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(null), ms);
  });
}

async function runPreload(
  onProgress?: (loaded: number, total: number) => void,
): Promise<PreloadResult> {
  const total = ASSET_MANIFEST.length;
  if (total === 0) {
    // Fully procedural build — nothing to fetch.
    return { ok: true, timedOut: false, failed: [] };
  }

  let loaded = 0;
  const failed: string[] = [];
  const work = Promise.all(
    ASSET_MANIFEST.map(async (asset) => {
      try {
        await loadOne(asset);
        loaded += 1;
        onProgress?.(loaded, total);
      } catch {
        failed.push(asset.id);
      }
    }),
  ).then(() => undefined);

  const winner = await Promise.race([work, withTimeout(ASSET_TIMEOUT_MS)]);
  if (winner === null) {
    // Timed out: let the loads continue in the background, but tell the
    // caller to proceed — nobody waits behind the intro forever.
    void work;
    return { ok: failed.length === 0, timedOut: true, failed };
  }
  return { ok: failed.length === 0, timedOut: false, failed };
}

export function preloadAssets(
  onProgress?: (loaded: number, total: number) => void,
): Promise<PreloadResult> {
  if (!inflight) {
    inflight = runPreload(onProgress);
  }
  return inflight;
}
