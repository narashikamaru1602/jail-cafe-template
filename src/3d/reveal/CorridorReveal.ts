// ============================================================================
// CORRIDOR REVEAL — distance-driven activation for cells and lamps.
// ----------------------------------------------------------------------------s
// Pure computation over flat Float32 buffers (no React, no allocation per
// frame beyond the values themselves). PrisonEnvironment owns the actual
// InstancedMeshes and simply copies these activation values into instance
// colours each frame while anything is still moving.
//
// Activation for element at world z:
//   deepestSource = cameraZ            // how deep the viewer has moved
//   d             = deepestSource - elementZ   // >0 ⇒ already passed it
//   f             = clamp((triggerDistance - d) / span, 0, 1)
//   activation    = f * globalGate
//
// The global gate ramps once the leaves begin opening, so nothing
// in the dark stirs before the gate has opened.
// ============================================================================

import type { CorridorLayout } from "../prison/prisonTypes";
import type { RevealConfig } from "./revealConfig";

export interface RevealSources {
  /** Camera world z (positive = still in the entry hall). */
  readonly cameraZ: number;
  /** Global 0..1 gate ramp from IntroController.revealGate. */
  readonly gate: number;
  /** Shared clock (seconds) for flicker. */
  readonly time: number;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export class CorridorReveal {
  /** Per-cell glow activation, parallel to layout.glows. */
  readonly glowActivation: Float32Array;
  /** Per-lamp activation, parallel to layout.lamps. */
  readonly lampActivation: Float32Array;
  private readonly glowZ: Float32Array;
  private readonly lampZ: Float32Array;
  private readonly lampWarmth: Float32Array;

  constructor(
    private readonly cfg: RevealConfig,
    layout: CorridorLayout,
  ) {
    this.glowActivation = new Float32Array(layout.glows.length);
    this.lampActivation = new Float32Array(layout.lamps.length);
    this.glowZ = new Float32Array(layout.glows.length);
    this.lampZ = new Float32Array(layout.lamps.length);
    this.lampWarmth = new Float32Array(layout.lamps.length);
    for (let i = 0; i < layout.glows.length; i++) {
      this.glowZ[i] = layout.glows[i]!.z;
    }
    for (let i = 0; i < layout.lamps.length; i++) {
      const lamp = layout.lamps[i]!;
      this.lampZ[i] = lamp.z;
      this.lampWarmth[i] = lamp.warmth;
    }
  }

  private activationFor(elementZ: number, deepest: number): number {
    const d = deepest - elementZ;
    return clamp01((this.cfg.triggerDistance - d) / this.cfg.span);
  }

  /**
   * Recomputes both buffers. Returns true when the GPU instance-colour
   * buffers must be re-uploaded (i.e. anything visible has changed).
   */
  update(sources: RevealSources): boolean {
    if (sources.gate <= 0) {
      // Nothing may stir before the sequence opens the corridor.
      let changed = false;
      for (let i = 0; i < this.glowActivation.length; i++) {
        if (this.glowActivation[i] !== 0) {
          this.glowActivation[i] = 0;
          changed = true;
        }
      }
      for (let i = 0; i < this.lampActivation.length; i++) {
        if (this.lampActivation[i] !== 0) {
          this.lampActivation[i] = 0;
          changed = true;
        }
      }
      return changed;
    }

    const deepest = sources.cameraZ;
    let changed = false;

    for (let i = 0; i < this.glowActivation.length; i++) {
      const base = this.activationFor(this.glowZ[i]!, deepest) * sources.gate;
      // Cell glow breathes very slightly once lit.
      const value =
        base > 0.02
          ? base * (1 - this.cfg.flicker * 0.5 * (1 + Math.sin(sources.time * 2.1 + i * 1.9)))
          : base;
      if (Math.abs(value - this.glowActivation[i]!) > 0.002) {
        this.glowActivation[i] = value;
        changed = true;
      }
    }

    for (let i = 0; i < this.lampActivation.length; i++) {
      let value = this.activationFor(this.lampZ[i]!, deepest) * sources.gate * this.lampWarmth[i]!;
      if (value > 0.02) {
        if (i % 7 === 3) {
          // A failing lamp: mostly dark, sputters on.
          value *= Math.sin(sources.time * 17 + i) > 0.75 ? 1 : 0.12;
        } else {
          value *= 1 - this.cfg.flicker * (0.5 + 0.5 * Math.sin(sources.time * 9.3 + i * 4.7));
        }
      }
      if (Math.abs(value - this.lampActivation[i]!) > 0.002) {
        this.lampActivation[i] = value;
        changed = true;
      }
    }

    return changed;
  }
}
