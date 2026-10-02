// ============================================================================
// PRISON LIGHTS — budgeted, clock-driven light rig.
// ----------------------------------------------------------------------------s
// Hard caps from the quality tier (pointLightBudget): HIGH 4 / MED 2 / LOW 1.
// The only real lights in the scene:
//   * hemisphere base (flat, cheap ambience)
//   * one warm key spot over the gate (the only shadow caster, HIGH only)
//   * N corridor point lights that fade up with the reveal gate, with a
//     subtle per-light flicker so the place feels alive
// Intensities are written imperatively from the shared clock — no React
// state, no per-frame allocation, and the light COUNT never changes at
// runtime (creating/destroying lights mid-flight would thrash shaders).
// ============================================================================

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import type { IntroController } from "../intro/IntroController";
import type { QualitySettings } from "../performance/quality";
import { ATMOSPHERE } from "./atmosphereConfig";

interface PrisonLightsProps {
  quality: QualitySettings;
  controller: IntroController;
}

/** Lights ramp in over the first second of the sequence (from black). */
const BASE_RAMP_SECONDS = 1.0;

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function PrisonLights({ quality, controller }: PrisonLightsProps) {
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const spotRef = useRef<THREE.SpotLight>(null);
  const pointRefs = useRef<(THREE.PointLight | null)[]>([]);

  const budget = quality.pointLightBudget;
  const lights = ATMOSPHERE.corridorLights.slice(0, budget);

  useFrame(() => {
    const t = controller.time;
    const base = clamp01(t / BASE_RAMP_SECONDS);
    const key = clamp01((t - 0.15) / (BASE_RAMP_SECONDS * 1.1));
    const reveal = controller.revealGate;

    if (hemiRef.current) {
      hemiRef.current.intensity = ATMOSPHERE.hemiIntensity * base;
    }
    if (spotRef.current) {
      // Micro-flicker: old wiring never burns perfectly steady.
      const flicker = 1 - 0.04 * (0.5 + 0.5 * Math.sin(t * 11.3));
      spotRef.current.intensity = ATMOSPHERE.keySpot.intensity * key * flicker;
    }
    const refs = pointRefs.current;
    for (let i = 0; i < refs.length; i++) {
      const light = refs[i];
      if (!light) continue;
      const flicker = 1 - 0.07 * (0.5 + 0.5 * Math.sin(t * (7 + i * 1.7) + i * 2.1));
      light.intensity = (lights[i]?.intensity ?? 0) * reveal * flicker;
    }
  });

  return (
    <>
      <hemisphereLight ref={hemiRef} args={[ATMOSPHERE.hemiSky, ATMOSPHERE.hemiGround, 0]} />

      {/* Key spot over the gate — HIGH tier only casts its shadow. */}
      <spotLight
        ref={spotRef}
        position={[
          ATMOSPHERE.keySpot.position[0],
          ATMOSPHERE.keySpot.position[1],
          ATMOSPHERE.keySpot.position[2],
        ]}
        angle={ATMOSPHERE.keySpot.angle}
        penumbra={ATMOSPHERE.keySpot.penumbra}
        distance={ATMOSPHERE.keySpot.distance}
        decay={ATMOSPHERE.keySpot.decay}
        color={ATMOSPHERE.keySpot.color}
        intensity={0}
        castShadow={quality.shadows}
        shadow-mapSize-width={quality.shadowMapSize}
        shadow-mapSize-height={quality.shadowMapSize}
        shadow-bias={-0.0015}
      />

      {/* Budgeted corridor lights (count fixed for the whole session). */}
      {lights.map((light, i) => (
        <pointLight
          key={`corridor-${i}`}
          ref={(el) => {
            pointRefs.current[i] = el;
          }}
          position={[light.position[0], light.position[1], light.position[2]]}
          color={light.color}
          intensity={0}
          distance={13}
          decay={1.35}
        />
      ))}
    </>
  );
}
