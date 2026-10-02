// ============================================================================
// SHOT PLAYER — the single delta-driven clock of the cinematic.
// ----------------------------------------------------------------------------s
// Design notes:
//  * One ShotPlayer instance owns all cinematic time. It is ticked by exactly
//    one useFrame (CameraRig) with a CLAMPED delta: Math.min(delta, 0.05).
//  * Nothing here runs per-frame React state; the player writes into a
//    pre-allocated mutable CameraPose object.
//  * Shot paths are CatmullRomCurve3 sampled by ARC LENGTH (getPointAt), then
//    an easing curve is applied to the arc-length parameter — the same
//    technique used by the reference cinematic intro repo, reimplemented here
//    (concept only; original work).
//  * Camera look-at targets follow their own curve so pans stay smooth.
// ============================================================================

import * as THREE from "three";

export type EasingName =
  | "linear"
  | "easeOutSine"
  | "easeInOutSine"
  | "easeInOutCubic"
  | "easeInOutQuart"
  | "easeOutCubic"
  | "easeInCubic";

/** Pure easing functions — math only, no per-frame allocation. */
export const EASINGS: Record<EasingName, (t: number) => number> = {
  linear: (t) => t,
  easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  easeInOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInCubic: (t) => t * t * t,
};

export type Vec3Tuple = [number, number, number];

export interface ShotDefinition {
  readonly id: string;
  /** Seconds. */
  readonly duration: number;
  readonly easing: EasingName;
  /** Camera position control points (Y-up, metres). */
  readonly position: readonly Vec3Tuple[];
  /** Look-at control points. */
  readonly target: readonly Vec3Tuple[];
  readonly fovStart: number;
  readonly fovEnd: number;
}

/** Mutable output written every frame — never allocated per frame. */
export interface CameraPose {
  readonly position: THREE.Vector3;
  readonly target: THREE.Vector3;
  fov: number;
  shotIndex: number;
  /** 0..1 progress inside the current shot (eased). */
  shotProgress: number;
  /** 0..1 progress across the whole sequence (linear). */
  sequenceProgress: number;
}

interface CompiledShot {
  readonly def: ShotDefinition;
  readonly positionCurve: THREE.CatmullRomCurve3;
  readonly targetCurve: THREE.CatmullRomCurve3;
  readonly ease: (t: number) => number;
  readonly startTime: number;
  readonly endTime: number;
}

const tmpEasedPos = new THREE.Vector3();

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export class ShotPlayer {
  readonly shots: readonly CompiledShot[];
  /** Duration of each shot in the sequence order, parallel to `shots`. */
  readonly duration: number;
  readonly pose: CameraPose;
  time = 0;

  constructor(defs: readonly ShotDefinition[]) {
    if (defs.length === 0) {
      throw new Error("ShotPlayer requires at least one shot");
    }
    const shots: CompiledShot[] = [];
    let cursor = 0;
    for (const def of defs) {
      shots.push({
        def,
        positionCurve: new THREE.CatmullRomCurve3(
          def.position.map((p) => new THREE.Vector3(p[0], p[1], p[2])),
          false,
          "centripetal",
        ),
        targetCurve: new THREE.CatmullRomCurve3(
          def.target.map((p) => new THREE.Vector3(p[0], p[1], p[2])),
          false,
          "centripetal",
        ),
        ease: EASINGS[def.easing],
        startTime: cursor,
        endTime: cursor + def.duration,
      });
      cursor += def.duration;
    }
    this.shots = shots;
    this.duration = cursor;
    const first = shots[0]!;
    this.pose = {
      position: first.positionCurve.getPointAt(0),
      target: first.targetCurve.getPointAt(0),
      fov: first.def.fovStart,
      shotIndex: 0,
      shotProgress: 0,
      sequenceProgress: 0,
    };
    this.applyShot(0, 0);
  }

  /** Absolute start time of a shot id (used to schedule gate/beat events). */
  shotOffset(id: string): number {
    const shot = this.shots.find((s) => s.def.id === id);
    if (!shot) {
      throw new Error(`Unknown shot id: ${id}`);
    }
    return shot.startTime;
  }

  get currentShot(): ShotDefinition {
    return this.shots[this.pose.shotIndex]!.def;
  }

  /**
   * Advance the clock. Returns true when the sequence has reached its end.
   * Called from exactly ONE useFrame — every other system reads `time`.
   */
  tick(dt: number): boolean {
    if (this.time >= this.duration) {
      return true;
    }
    this.time = Math.min(this.time + dt, this.duration);
    const index = this.indexOfTime(this.time);
    const shot = this.shots[index]!;
    const local = this.time - shot.startTime;
    const raw = shot.def.duration > 0 ? clamp01(local / shot.def.duration) : 1;
    this.applyShot(index, raw);
    return this.time >= this.duration;
  }

  /** Jump straight to the final pose (skip / hard cut). */
  finish(): void {
    this.time = this.duration;
    const index = this.shots.length - 1;
    this.applyShot(index, 1);
  }

  private indexOfTime(time: number): number {
    for (let i = this.shots.length - 1; i >= 0; i--) {
      const shot = this.shots[i]!;
      if (time >= shot.startTime) return i;
    }
    return 0;
  }

  private applyShot(index: number, rawProgress: number): void {
    const shot = this.shots[index]!;
    const eased = clamp01(shot.ease(rawProgress));
    // Arc-length parameterised sampling keeps speed even along the path;
    // easing the parameter gives us the cinematic acceleration profile.
    const u = Math.min(eased, 0.999999);
    shot.positionCurve.getPointAt(u, tmpEasedPos);
    this.pose.position.copy(tmpEasedPos);
    shot.targetCurve.getPointAt(u, this.pose.target);
    this.pose.fov = shot.def.fovStart + (shot.def.fovEnd - shot.def.fovStart) * eased;
    this.pose.shotIndex = index;
    this.pose.shotProgress = eased;
    this.pose.sequenceProgress = clamp01(this.time / this.duration);
  }
}
