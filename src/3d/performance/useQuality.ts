// ============================================================================
// useQuality — the React entry point to the quality tier system.
// ----------------------------------------------------------------------------s
// Resolves the tier exactly once per mount (useState initialiser), so no
// animation frame ever triggers React state. The returned object is stable
// for the lifetime of the Canvas.
// ============================================================================

import { useMemo } from "react";
import { resolveQuality, type QualitySettings } from "./quality";

export function useQuality(): QualitySettings {
  return useMemo(() => resolveQuality(), []);
}

export { detectQualityTier, getQualitySettings } from "./quality";
export type { QualitySettings, QualityTier } from "./quality";
