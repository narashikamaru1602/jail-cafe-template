// ============================================================================
// useAudio — React binding for the audio manager.
// ----------------------------------------------------------------------------s
// State here only changes on DISCRETE user actions (mute toggle, volume set,
// first gesture unlock) — never per animation frame.
// ============================================================================

import { useCallback, useEffect, useState } from "react";
import { audioManager, type AudioSnapshot } from "./AudioManager";

export function useAudio(): AudioSnapshot & {
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  unlock: () => void;
} {
  const [snapshot, setSnapshot] = useState<AudioSnapshot>(() => audioManager.snapshot);

  useEffect(() => audioManager.subscribe(() => setSnapshot(audioManager.snapshot)), []);

  const toggleMute = useCallback(() => audioManager.toggleMute(), []);
  const setVolume = useCallback((volume: number) => audioManager.setVolume(volume), []);
  const unlock = useCallback(() => audioManager.unlock(), []);

  return { ...snapshot, toggleMute, setVolume, unlock };
}
