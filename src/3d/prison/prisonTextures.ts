// ============================================================================
// PRISON TEXTURES — procedural canvas maps (no image files, no network).
// ----------------------------------------------------------------------------s
// Tiny 256² canvas textures generated once per session and shared by the
// material singletons in PrisonMaterials. They exist to break up the flat
// surfaces: concrete grain on the walls, slab joints on the floor — the
// material colour multiplies the map, so the palette stays exactly as dark
// as authored while the surfaces gain variation and depth.
//
// Everything is deterministic (seeded PRNG) so every reload looks identical.
// SSR-safe: every getter returns null when there is no DOM (the 3D chunk is
// client-only, but nothing here may throw during a server render).
// ============================================================================

import * as THREE from "three";

/** Deterministic PRNG (same algorithm as the dust field). */
function makeRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function createCanvas(
  size: number,
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  return { canvas, ctx };
}

function toTexture(
  canvas: HTMLCanvasElement,
  repeat: [number, number],
  srgb: boolean,
): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.anisotropy = 4;
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/** Shared speckle grain — dark pits + light aggregate flecks. */
function drawSpeckle(
  ctx: CanvasRenderingContext2D,
  size: number,
  rand: () => number,
  dark: number,
  light: number,
): void {
  for (let i = 0; i < dark; i++) {
    ctx.fillStyle = `rgba(0,0,0,${(0.03 + rand() * 0.07).toFixed(3)})`;
    ctx.fillRect(rand() * size, rand() * size, 1 + rand() * 2, 1 + rand() * 2);
  }
  for (let i = 0; i < light; i++) {
    ctx.fillStyle = `rgba(255,255,255,${(0.04 + rand() * 0.05).toFixed(3)})`;
    ctx.fillRect(rand() * size, rand() * size, 1 + rand() * 1.5, 1 + rand() * 1.5);
  }
}

// ── caches (undefined = not built yet, null = no DOM available) ─────────────
let concreteCanvas: HTMLCanvasElement | null | undefined;
let slabCanvas: HTMLCanvasElement | null | undefined;
let wallTex: THREE.CanvasTexture | null | undefined;
let ceilingTex: THREE.CanvasTexture | null | undefined;
let boxWallTex: THREE.CanvasTexture | null | undefined;
let floorTex: THREE.CanvasTexture | null | undefined;
let poolTex: THREE.CanvasTexture | null | undefined;
let coneTex: THREE.CanvasTexture | null | undefined;
let hazeTex: THREE.CanvasTexture | null | undefined;

/**
 * Rough concrete — blotches, hairline cracks and vertical weather streaks.
 * Near-white base so the material colour keeps full control of the tone.
 */
function buildConcreteCanvas(): HTMLCanvasElement | null {
  const c = createCanvas(256);
  if (!c) return null;
  const { ctx } = c;
  const rand = makeRandom(1337);

  ctx.fillStyle = "#efefec";
  ctx.fillRect(0, 0, 256, 256);

  // Large soft blotches (poured-concrete unevenness).
  for (let i = 0; i < 26; i++) {
    const x = rand() * 256;
    const y = rand() * 256;
    const r = 30 + rand() * 60;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, "rgba(0,0,0,0.045)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  drawSpeckle(ctx, 256, rand, 1500, 700);

  // Hairline cracks.
  ctx.strokeStyle = "rgba(0,0,0,0.16)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    let x = rand() * 256;
    let y = rand() * 256;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const segments = 4 + Math.floor(rand() * 4);
    for (let s = 0; s < segments; s++) {
      x += (rand() - 0.5) * 46;
      y += rand() * 34;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Vertical weather streaks (water staining).
  for (let i = 0; i < 7; i++) {
    const x = rand() * 256;
    const w = 3 + rand() * 6;
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "rgba(0,0,0,0.07)");
    grad.addColorStop(0.7, "rgba(0,0,0,0.03)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, w, 256);
  }

  return c.canvas;
}

/** Poured floor slabs — same grain plus 1 m joints (dark line + highlight). */
function buildSlabCanvas(): HTMLCanvasElement | null {
  const c = createCanvas(256);
  if (!c) return null;
  const { ctx } = c;
  const rand = makeRandom(7331);

  ctx.fillStyle = "#eeece8";
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 16; i++) {
    const x = rand() * 256;
    const y = rand() * 256;
    const r = 26 + rand() * 50;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, "rgba(0,0,0,0.04)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  drawSpeckle(ctx, 256, rand, 900, 450);

  // Slab joints (the texture tiles every ~1.8 m → joints every ~0.9 m).
  for (const pos of [0, 128, 256]) {
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.fillRect(0, pos, 256, 2);
    ctx.fillRect(pos, 0, 2, 256);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(0, pos + 2, 256, 1);
    ctx.fillRect(pos + 2, 0, 1, 256);
  }

  return c.canvas;
}

/** Radial falloff for fake floor light pools (additive). */
function buildPoolCanvas(): HTMLCanvasElement | null {
  const c = createCanvas(128);
  if (!c) return null;
  const { ctx } = c;
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.3, "rgba(255,255,255,0.62)");
  grad.addColorStop(0.62, "rgba(255,255,255,0.24)");
  grad.addColorStop(0.85, "rgba(255,255,255,0.05)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  return c.canvas;
}

/** Vertical falloff for the cheap volumetric light shafts (additive). */
function buildConeCanvas(): HTMLCanvasElement | null {
  const c = createCanvas(64);
  if (!c) return null;
  const { ctx } = c;
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, "rgba(255,255,255,0.9)");
  grad.addColorStop(0.18, "rgba(255,255,255,0.52)");
  grad.addColorStop(0.55, "rgba(255,255,255,0.18)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 256);
  return c.canvas;
}

/**
 * Soft radial falloff for the far-end haze planes — without it, an
 * unfogged quad reads as a hard-edged floating rectangle instead of haze.
 */
function buildHazeCanvas(): HTMLCanvasElement | null {
  const c = createCanvas(128);
  if (!c) return null;
  const { ctx } = c;
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.72)");
  grad.addColorStop(0.68, "rgba(255,255,255,0.26)");
  grad.addColorStop(0.88, "rgba(255,255,255,0.05)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  return c.canvas;
}

function getConcreteCanvas(): HTMLCanvasElement | null {
  if (concreteCanvas === undefined) concreteCanvas = buildConcreteCanvas();
  return concreteCanvas;
}

function getSlabCanvas(): HTMLCanvasElement | null {
  if (slabCanvas === undefined) slabCanvas = buildSlabCanvas();
  return slabCanvas;
}

/** Corridor walls (extruded shape: UVs are in metres → 2 m tiles). */
export function getWallTexture(): THREE.CanvasTexture | null {
  if (wallTex === undefined) {
    const c = getConcreteCanvas();
    wallTex = c ? toTexture(c, [0.5, 0.5], true) : null;
  }
  return wallTex;
}

/** Ceiling planes (UV 0..1 across the plane → tile to ~2 m). */
export function getCeilingTexture(): THREE.CanvasTexture | null {
  if (ceilingTex === undefined) {
    const c = getConcreteCanvas();
    ceilingTex = c ? toTexture(c, [3, 26], true) : null;
  }
  return ceilingTex;
}

/** Box built walls (hall + dead ends: UV 0..1 per face → tile to ~2 m). */
export function getBoxWallTexture(): THREE.CanvasTexture | null {
  if (boxWallTex === undefined) {
    const c = getConcreteCanvas();
    boxWallTex = c ? toTexture(c, [3, 1.7], true) : null;
  }
  return boxWallTex;
}

/** Floor planes (slab joints on a ~0.9 m grid). */
export function getFloorTexture(): THREE.CanvasTexture | null {
  if (floorTex === undefined) {
    const c = getSlabCanvas();
    floorTex = c ? toTexture(c, [3.2, 29], true) : null;
  }
  return floorTex;
}

/** Additive floor-pool mask. */
export function getPoolTexture(): THREE.CanvasTexture | null {
  if (poolTex === undefined) {
    const c = buildPoolCanvas();
    poolTex = c ? toTexture(c, [1, 1], false) : null;
  }
  return poolTex;
}

/** Additive light-shaft gradient (bright at the fixture, gone at the floor). */
export function getConeTexture(): THREE.CanvasTexture | null {
  if (coneTex === undefined) {
    const c = buildConeCanvas();
    coneTex = c ? toTexture(c, [1, 1], false) : null;
  }
  return coneTex;
}

/** Soft radial alpha for the far-end haze planes (kills hard quad edges). */
export function getHazeTexture(): THREE.CanvasTexture | null {
  if (hazeTex === undefined) {
    const c = buildHazeCanvas();
    hazeTex = c ? toTexture(c, [1, 1], false) : null;
  }
  return hazeTex;
}
