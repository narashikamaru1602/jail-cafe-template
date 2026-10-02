// ============================================================================
// JAIL SCENE — composition root of the cinematic 3D experience.
// ----------------------------------------------------------------------------s
// Child order matters: CameraRig is FIRST because it owns the clock — R3F
// runs useFrame callbacks in subscription order (children in JSX order, then
// the parent), so every other system reads an already-advanced clock in the
// same frame instead of lagging one behind.
//
//   CameraRig        → ticks the ONE clamped delta clock, drives the camera
//   PrisonAtmosphere → background / fog / far-end haze
//   PrisonLights     → budgeted light rig
//   PrisonEnvironment→ corridor set + distance-driven reveal
//   JailGate         → double-leaf gate pose from the shared clock
//   AdaptiveDpr/Preload (drei) → mobile pixel-ratio safety + shader warm-up
//
// Readiness: onReady fires once assets have settled AND at least two frames
// have passed (i.e. the canvas really rendered something).
// ============================================================================

import { AdaptiveDpr, Preload } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { audioManager } from "../audio/AudioManager";
import { PrisonAtmosphere } from "./atmosphere/PrisonAtmosphere";
import { PrisonLights } from "./atmosphere/PrisonLights";
import { SceneEnvironment } from "./atmosphere/SceneEnvironment";
import { ATMOSPHERE } from "./atmosphere/atmosphereConfig";
import { preloadAssets } from "./assets/preloadAssets";
import { CameraRig } from "./camera/CameraRig";
import { JailGate } from "./gate/JailGate";
import type { IntroController } from "./intro/IntroController";
import type { QualitySettings } from "./performance/quality";
import { PrisonEnvironment } from "./prison/PrisonEnvironment";

interface JailSceneProps {
  quality: QualitySettings;
  controller: IntroController;
  onReady: () => void;
  onSequenceComplete: () => void;
}

export function JailScene({ quality, controller, onReady, onSequenceComplete }: JailSceneProps) {
  const ready = useRef({ frames: 0, assets: false, fired: false });

  useEffect(() => {
    let cancelled = false;
    // Asset preload: resolves even on failure/timeout (safe failure path).
    void preloadAssets().then(() => {
      if (!cancelled) ready.current.assets = true;
    });

    // Discrete cinematic beats → audio (no clips = silent no-op today).
    const unsubscribe = controller.subscribe((event) => {
      if (event.type === "gate") {
        audioManager.play(event.name === "unlock" ? "gateUnlock" : "gateOpen");
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [controller]);

  useFrame(() => {
    const state = ready.current;
    state.frames += 1;
    if (!state.fired && state.frames > 1 && state.assets) {
      state.fired = true;
      onReady();
    }
  });

  return (
    <>
      <CameraRig controller={controller} onSequenceComplete={onSequenceComplete} />
      <PrisonAtmosphere quality={quality} />
      {/* IBL for the metals (gate/brass/metalwork) — procedural, no network HDRI. */}
      <SceneEnvironment intensity={ATMOSPHERE.envIntensity} />
      <PrisonLights quality={quality} controller={controller} />
      <PrisonEnvironment quality={quality} controller={controller} />
      <JailGate controller={controller} shadows={quality.shadows} />
      {/* Pixel-ratio safety net + upfront shader compilation (mobile). */}
      <AdaptiveDpr />
      <Preload all />
    </>
  );
}
