// ============================================================================
// INTRO CONTROLLER — shared, mutable state for the whole cinematic.
// ----------------------------------------------------------------------------s
// One instance lives for the lifetime of the Canvas. It owns:
//   * the ShotPlayer (the ONE delta-driven clock — ticked only by CameraRig)
//   * the gate schedule derived from the same shot durations
//   * the interior reveal gate (0..1 ramp once the leaves open)
//   * discrete phase + completion bookkeeping
//
// React only ever hears about DISCRETE events (unlock, open, sequence
// complete) via subscribe()/emit() — never per-frame values.
// ============================================================================

import { ShotPlayer, type ShotDefinition } from "../cinematic/ShotPlayer";
import { buildGateTimeline, phaseForShot, type IntroPhase } from "../cinematic/sequence.config";
import { buildGateSchedule, type GateSchedule } from "../gate/gateTypes";

export type IntroEvent = { type: "complete" } | { type: "gate"; name: "unlock" | "open" };

export type IntroEventListener = (event: IntroEvent) => void;

/**
 * Seconds over which the interior reveal gate ramps once the leaves start
 * opening: the ramp spans the whole walk-through (opens 0.9s → full at
 * 2.5s), so cells, lamps and corridor lights awaken progressively as the
 * viewer approaches and are fully settled before the handoff (2.6s).
 */
const REVEAL_RAMP_SECONDS = 1.6;

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export class IntroController {
  readonly player: ShotPlayer;
  readonly gateSchedule: GateSchedule;
  completed = false;
  /** Interior reveal gate, 0..1 (written by tick()). */
  revealGate = 0;

  private readonly listeners = new Set<IntroEventListener>();
  private readonly revealStart: number;

  constructor(sequence: readonly ShotDefinition[]) {
    this.player = new ShotPlayer(sequence);
    this.gateSchedule = buildGateSchedule(buildGateTimeline());
    // Nothing may stir before the leaves begin to open.
    this.revealStart = this.player.shotOffset("gateOpen");
  }

  /** Absolute sequence time in seconds — THE clock every system reads. */
  get time(): number {
    return this.player.time;
  }

  get phase(): IntroPhase {
    if (this.completed) return "done";
    return phaseForShot(this.player.currentShot.id);
  }

  /**
   * Advance the clock. Called from EXACTLY ONE useFrame (CameraRig) with a
   * clamped delta: Math.min(delta, 0.05).
   */
  tick(dt: number): void {
    if (this.completed) return;
    const finished = this.player.tick(dt);
    this.revealGate = clamp01((this.player.time - this.revealStart) / REVEAL_RAMP_SECONDS);
    if (finished) this.complete();
  }

  /** Skip / hard cut — jumps to the final pose and completes immediately. */
  skip(): void {
    if (this.completed) return;
    this.player.finish();
    this.revealGate = 1;
    this.complete();
  }

  private complete(): void {
    if (this.completed) return;
    this.completed = true;
    this.revealGate = 1;
    this.emit({ type: "complete" });
  }

  /** Returns an unsubscribe function. */
  subscribe(listener: IntroEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(event: IntroEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}
