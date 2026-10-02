// ============================================================================
// AUDIO CONFIG — buses, defaults and the (deliberately empty) sample list.
// ----------------------------------------------------------------------------s
// No audio is invented or downloaded: every entry is null until a file with
// KNOWN provenance/licensing is added. The whole subsystem is written so it
// is silent-safe today and drops-in tomorrow — without it ever being a
// blocker for the intro.
// ============================================================================

export type SfxName = "gateUnlock" | "gateOpen" | "ambience";

export interface AudioSettings {
  /** 0..1 master volume. */
  readonly master: number;
  /** 0..1 SFX bus. */
  readonly sfx: number;
  /** 0..1 ambience bus. */
  readonly ambience: number;
  readonly muted: boolean;
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  master: 0.7,
  sfx: 0.9,
  ambience: 0.35,
  muted: false,
};

/**
 * null = no licensed file yet → the bus stays silent.
 * Add files here ONLY when provenance is documented (see ATTRIBUTION.md).
 */
export const AUDIO_FILES: Record<SfxName, string | null> = {
  gateUnlock: null,
  gateOpen: null,
  ambience: null,
};

export function hasAudioAssets(): boolean {
  return (Object.keys(AUDIO_FILES) as SfxName[]).some((key) => AUDIO_FILES[key] !== null);
}
