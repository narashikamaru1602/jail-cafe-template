// ============================================================================
// Capability check used to decide whether it's worth mounting the 3D intro
// at all. Kept deliberately conservative: we only opt OUT of the 3D
// experience when we're fairly confident it won't run well, since the
// fallback still gets people into the site just fine.
//
// This module is the single source of truth for device capability signals:
//   * canRunIntroScene() — should the cinematic be attempted at all?
//   * getDeviceHints()   — raw signals consumed by the quality tier system
// ============================================================================

/** Raw, best-effort capability signals (all optional — browsers guard them). */
export interface DeviceHints {
  readonly deviceMemory?: number;
  readonly hardwareConcurrency?: number;
  readonly isCoarsePointer: boolean;
}

/** Reads whatever the browser is willing to expose. Never throws. */
export function getDeviceHints(): DeviceHints {
  if (typeof navigator === "undefined") {
    return { isCoarsePointer: false };
  }
  const nav = navigator as Navigator & { deviceMemory?: number };
  const coarse =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;

  return {
    isCoarsePointer: coarse,
    ...(typeof nav.deviceMemory === "number" ? { deviceMemory: nav.deviceMemory } : {}),
    ...(typeof nav.hardwareConcurrency === "number"
      ? { hardwareConcurrency: nav.hardwareConcurrency }
      : {}),
  };
}

/** A very rough signal for "low-end device": both properties must look bad
 *  (either one alone is too noisy to trust). Only ever used to opt OUT. */
function looksLikeLowEndDevice(): boolean {
  const hints = getDeviceHints();
  const lowMemory = typeof hints.deviceMemory === "number" && hints.deviceMemory <= 2;
  const lowCores = typeof hints.hardwareConcurrency === "number" && hints.hardwareConcurrency <= 4;
  return lowMemory && lowCores;
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    return !!gl;
  } catch {
    return false;
  }
}

/** Whether the jail-gate cinematic intro should be attempted on this device. */
export function canRunIntroScene(): boolean {
  if (typeof window === "undefined") return false;
  if (!hasWebGL()) return false;
  if (looksLikeLowEndDevice()) return false;
  return true;
}
