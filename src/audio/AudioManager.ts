// ============================================================================
// AUDIO MANAGER — autoplay-safe, gesture-unlocked, mute/volume aware.
// ----------------------------------------------------------------------------s
// Rules it obeys:
//   * the AudioContext is created ONLY inside a user gesture (pointer/keydown)
//     — never on load — so browsers never flag the page for autoplay abuse
//   * play() is a total no-op when: no context yet, muted, or the clip has no
//     licensed file (all clips start as null — see audioConfig)
//   * state changes (mute/volume) are DISCRETE events published to
//     subscribers → React state only ever updates on real user actions
// ============================================================================

import {
  AUDIO_FILES,
  DEFAULT_AUDIO_SETTINGS,
  type AudioSettings,
  type SfxName,
} from "./audioConfig";

export interface AudioSnapshot {
  readonly muted: boolean;
  readonly volume: number;
  readonly unlocked: boolean;
  /** True once at least one clip with known provenance exists. */
  readonly hasClips: boolean;
}

type Listener = (snapshot: AudioSnapshot) => void;

export class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private readonly buffers = new Map<SfxName, AudioBuffer>();
  private readonly listeners = new Set<Listener>();
  private settings: AudioSettings = { ...DEFAULT_AUDIO_SETTINGS };
  private gesturesAttached = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.attachGestureUnlock();
    }
  }

  get snapshot(): AudioSnapshot {
    return {
      muted: this.settings.muted,
      volume: this.settings.master,
      unlocked: this.ctx !== null,
      hasClips: (Object.keys(AUDIO_FILES) as SfxName[]).some((key) => AUDIO_FILES[key] !== null),
    };
  }

  /** Returns an unsubscribe function. */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const snap = this.snapshot;
    for (const listener of this.listeners) {
      listener(snap);
    }
  }

  private attachGestureUnlock(): void {
    if (this.gesturesAttached) return;
    this.gesturesAttached = true;
    const handler = (): void => {
      this.unlock();
    };
    // Capture phase so we unlock even if some component stops propagation.
    window.addEventListener("pointerdown", handler, { capture: true, once: false });
    window.addEventListener("keydown", handler, { capture: true, once: false });
  }

  /** Safe to call any number of times; only meaningful inside a gesture. */
  unlock(): void {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const Ctor: typeof AudioContext | undefined =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      try {
        this.ctx = new Ctor();
        this.master = this.ctx.createGain();
        this.master.connect(this.ctx.destination);
        this.applyGain();
      } catch {
        this.ctx = null;
        this.master = null;
        return;
      }
      this.notify();
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume().catch(() => undefined);
    }
  }

  setMuted(muted: boolean): void {
    if (this.settings.muted === muted) return;
    this.settings = { ...this.settings, muted };
    this.applyGain();
    this.notify();
  }

  setVolume(volume: number): void {
    const next = volume < 0 ? 0 : volume > 1 ? 1 : volume;
    if (this.settings.master === next) return;
    this.settings = { ...this.settings, master: next };
    this.applyGain();
    this.notify();
  }

  toggleMute(): void {
    this.setMuted(!this.settings.muted);
  }

  private applyGain(): void {
    if (this.master) {
      this.master.gain.value = this.settings.muted ? 0 : this.settings.master;
    }
  }

  /** Loads + decodes a clip. Silently does nothing when none is configured. */
  async load(name: SfxName): Promise<void> {
    const url = AUDIO_FILES[name];
    if (!url || !this.ctx || this.buffers.has(name)) return;
    try {
      const response = await fetch(url);
      const raw = await response.arrayBuffer();
      const decoded = await this.ctx.decodeAudioData(raw);
      this.buffers.set(name, decoded);
    } catch {
      // Missing/broken audio must never break the intro.
    }
  }

  /** Fire-and-forget playback (no-op when locked, muted or unlicensed). */
  play(name: SfxName, gain = 1): void {
    if (!this.ctx || !this.master || this.settings.muted) return;
    const buffer = this.buffers.get(name);
    if (!buffer || this.ctx.state !== "running") return;
    try {
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      const bus = this.ctx.createGain();
      const busVolume = name === "ambience" ? this.settings.ambience : this.settings.sfx;
      bus.gain.value = busVolume * gain;
      source.connect(bus);
      bus.connect(this.master);
      source.start();
    } catch {
      // Playback is best-effort.
    }
  }
}

/** Singleton — lives with the 3D chunk, never on the prerendered shell. */
export const audioManager = new AudioManager();
