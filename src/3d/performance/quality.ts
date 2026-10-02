// ============================================================================
// QUALITY — device-aware quality tiers.
// ----------------------------------------------------------------------------
// One place decides LOW / MEDIUM / HIGH for the whole 3D experience. Every
// other system (Canvas DPR, shadows, light budget, corridor density, fog
// range, particles) reads the resolved settings from here so
// we never end up with two disagreeing capability decisions.
//
// Detection is intentionally conservative and runs once per mount — it is not
// a per-frame concern. A `?quality=low|medium|high` query-string override is
// provided for testing on a single device (dev/QA convenience only).
// ============================================================================

import { getDeviceHints } from "../../intro/device-support";

export type QualityTier = "LOW" | "MEDIUM" | "HIGH";

export interface QualitySettings {
  readonly tier: QualityTier;
  /** Upper bound of the R3F `dpr` range (device pixel ratio clamp). */
  readonly dprMax: number;
  readonly antialias: boolean;
  /** Whether the Canvas should allocate shadow maps at all. */
  readonly shadows: boolean;
  readonly shadowMapSize: number;
  /** Hard cap on dynamic point lights inside the corridor. */
  readonly pointLightBudget: number;
  /** Metres between prison cells — lower = denser = more draw calls. */
  readonly cellSpacing: number;
  /** Linear fog far distance (near is shared in atmosphereConfig). */
  readonly fogFar: number;
  /** Dust-mote particle count (0 disables the system). */
  readonly dustCount: number;
}

const TIERS: Record<QualityTier, QualitySettings> = {
  HIGH: {
    tier: "HIGH",
    dprMax: 2,
    antialias: true,
    shadows: true,
    shadowMapSize: 1024,
    pointLightBudget: 4,
    cellSpacing: 4,
    fogFar: 30,
    dustCount: 140,
  },
  MEDIUM: {
    tier: "MEDIUM",
    dprMax: 1.5,
    antialias: false,
    shadows: false,
    shadowMapSize: 512,
    pointLightBudget: 2,
    cellSpacing: 4,
    fogFar: 25,
    dustCount: 60,
  },
  LOW: {
    tier: "LOW",
    dprMax: 1.25,
    antialias: false,
    shadows: false,
    shadowMapSize: 256,
    pointLightBudget: 1,
    cellSpacing: 6,
    fogFar: 21,
    dustCount: 0,
  },
};

export function getQualitySettings(tier: QualityTier): QualitySettings {
  return TIERS[tier];
}

/** `?quality=low|medium|high` — returns null when not requested. */
function readTierOverride(): QualityTier | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = new URLSearchParams(window.location.search).get("quality");
    if (raw === null) return null;
    const up = raw.toUpperCase();
    if (up === "LOW" || up === "MEDIUM" || up === "HIGH") return up;
  } catch {
    // Malformed URL/search params must never break the experience.
  }
  return null;
}

/**
 * Decide the tier once. Signals used (all optional/experimental — they only
 * ever push the tier DOWN, never force it up):
 *   - deviceMemory / hardwareConcurrency from device-support
 *   - viewport width (mobile-first: phones never get HIGH)
 */
export function detectQualityTier(): QualityTier {
  const override = readTierOverride();
  if (override) return override;
  if (typeof window === "undefined") return "MEDIUM";

  const hints = getDeviceHints();
  const memory = hints.deviceMemory;
  const cores = hints.hardwareConcurrency;
  const narrow =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(max-width: 767px)").matches
      : false;

  const veryWeak =
    (memory !== undefined && memory <= 2) || (cores !== undefined && cores <= 4 && narrow);
  if (veryWeak) return "LOW";
  if (narrow || (memory !== undefined && memory <= 4)) return "MEDIUM";
  return "HIGH";
}

/** Memoised once per component mount — never per frame. */
export function resolveQuality(): QualitySettings {
  return getQualitySettings(detectQualityTier());
}
