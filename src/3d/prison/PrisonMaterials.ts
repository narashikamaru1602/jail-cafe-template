// ============================================================================
// PRISON MATERIALS — one shared material per look, created once.
// ----------------------------------------------------------------------------s
// Everything in the corridor and gate shares these instances, so the
// whole scene collapses into a handful of material state changes. Materials
// are module-level singletons (they never touch the WebGL context at
// construction), which means they live exactly as long as the lazy 3D chunk
// that imports them — no per-mesh clones, no per-frame allocation.
//
// Palette contract: charcoal + brass (from intro/constants' original
// COLORS: brass #c89f65 / deep #14120f) extended with a warm lamp glow.
// The concrete surfaces carry procedural canvas maps (prisonTextures) —
// the maps are near-white and only ADD grain/joint variation, so the
// authored dark palette is preserved exactly. Surfaces respond to light
// differently by role: rough concrete (floor/wall), machined metal
// (trim/conduit), forged iron (bars/gates), restrained brass highlights.
// ============================================================================

import * as THREE from "three";
import {
  getCeilingTexture,
  getConeTexture,
  getFloorTexture,
  getHazeTexture,
  getPoolTexture,
  getWallTexture,
  getBoxWallTexture,
} from "./prisonTextures";

const floor = new THREE.MeshStandardMaterial({
  color: "#14130f",
  roughness: 0.95,
  metalness: 0.05,
  map: getFloorTexture(),
});

const wall = new THREE.MeshStandardMaterial({
  color: "#1a1815",
  roughness: 0.92,
  metalness: 0.04,
  map: getWallTexture(),
});

/** Same concrete as `wall`, UV-scaled for box built walls (hall, dead ends). */
const wallBox = new THREE.MeshStandardMaterial({
  color: "#1a1815",
  roughness: 0.92,
  metalness: 0.04,
  map: getBoxWallTexture(),
});

const ceiling = new THREE.MeshStandardMaterial({
  color: "#121110",
  roughness: 0.96,
  metalness: 0.02,
  map: getCeilingTexture(),
});

/** Bars, cell frames, gate leaf frames — dark forged metal. */
const metalDark = new THREE.MeshStandardMaterial({
  color: "#2b2b30",
  roughness: 0.5,
  metalness: 0.75,
});

/** Slightly lighter machined metal (lock housing, frame trim, conduit). */
const metalFrame = new THREE.MeshStandardMaterial({
  color: "#33333a",
  roughness: 0.45,
  metalness: 0.7,
});

/** The brand accent — kept identical to the original intro brass. */
const brass = new THREE.MeshStandardMaterial({
  color: "#c89f65",
  roughness: 0.3,
  metalness: 0.95,
});

/** Cell interiors — never lit, absorbs light. */
const voidDark = new THREE.MeshStandardMaterial({
  color: "#050505",
  roughness: 1,
  metalness: 0,
});

/**
 * Instanced lamp capsules — MeshBasic + per-instance colour, so individual
 * lamps can be revealed/flickered WITHOUT owning a real light.
 */
const lampGlow = new THREE.MeshBasicMaterial({
  color: "#ffffff",
  toneMapped: false,
});

/** Warm panel behind each cell's bars — also instance-coloured. */
const cellGlow = new THREE.MeshBasicMaterial({
  color: "#ffffff",
  toneMapped: false,
});

/**
 * Warm haze at the dead end of the corridor (depth cue, zero light cost).
 * fog:false on purpose — otherwise the linear fog would erase it at
 * exactly the distance it is meant to glow. The soft radial map keeps it
 * reading as haze rather than a hard-edged floating rectangle.
 */
const farGlow = new THREE.MeshBasicMaterial({
  map: getHazeTexture(),
  color: "#c9873f",
  transparent: true,
  opacity: 0.42,
  toneMapped: false,
  depthWrite: false,
  fog: false,
});

/**
 * Fake floor light pools under the wall fixtures — additive, instance-
 * coloured by the reveal so they wake up with their lamp. One draw call,
 * no light budget spent.
 */
const lightPool = new THREE.MeshBasicMaterial({
  map: getPoolTexture(),
  color: "#ffffff",
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  opacity: 0.5,
  toneMapped: false,
});

/**
 * Cheap volumetric shafts from each wall fixture (open cone + gradient).
 * Instance-coloured with the lamp activation; fogged away with distance so
 * they never punch through the depth haze.
 */
const lightCone = new THREE.MeshBasicMaterial({
  map: getConeTexture(),
  color: "#ffffff",
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  opacity: 0.1,
  side: THREE.DoubleSide,
  toneMapped: false,
});

/**
 * Extremely subtle cool haze slab mid-corridor — separates foreground,
 * middle-ground and background against the warm far-end glow. Additive and
 * fog-free so its tint survives.
 */
const midHaze = new THREE.MeshBasicMaterial({
  map: getHazeTexture(),
  color: "#2c3b57",
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  opacity: 0.11,
  toneMapped: false,
  fog: false,
});

/**
 * Distant electrical fixture (cool strip on the dead-end wall). fog:false so
 * the linear fog — which fully blankets that distance — doesn't erase it;
 * kept dim and tiny so it reads as a serviced corridor, never as neon.
 */
const coolFixture = new THREE.MeshBasicMaterial({
  color: "#3d5a85",
  toneMapped: false,
  fog: false,
});

/** Dust motes. */
const dust = new THREE.PointsMaterial({
  color: "#cbbfa8",
  size: 0.035,
  sizeAttenuation: true,
  transparent: true,
  opacity: 0.3,
  depthWrite: false,
});

export const prisonMaterials = {
  floor,
  wall,
  wallBox,
  ceiling,
  metalDark,
  metalFrame,
  brass,
  voidDark,
  lampGlow,
  cellGlow,
  farGlow,
  lightPool,
  lightCone,
  midHaze,
  coolFixture,
  dust,
} as const;

export type PrisonMaterialName = keyof typeof prisonMaterials;
