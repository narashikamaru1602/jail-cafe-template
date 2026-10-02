// ============================================================================
// PRISON ATMOSPHERE — background, fog and the far-end depth layers.
// ----------------------------------------------------------------------------s
// Fog does triple duty here: it hides the end of the set (which simply stops,
// because this is a film set, not a dungeon), it gives the corridor depth,
// and it keeps the far reaches mysterious on LOW tiers where
// we can afford fewer lights.
//
// Depth is layered warm-to-cool: warm far glow at the dead end, an extremely
// subtle cool haze slab at mid-depth, and a tiny cool electrical fixture so
// the deep corridor reads as serviced rather than as a golden void.
// ============================================================================

import type { QualitySettings } from "../performance/quality";
import { prisonMaterials } from "../prison/PrisonMaterials";
import { ATMOSPHERE } from "./atmosphereConfig";

interface PrisonAtmosphereProps {
  quality: QualitySettings;
}

export function PrisonAtmosphere({ quality }: PrisonAtmosphereProps) {
  return (
    <>
      <color attach="background" args={[ATMOSPHERE.background]} />
      <fog attach="fog" args={[ATMOSPHERE.fogColor, ATMOSPHERE.fogNear, quality.fogFar]} />
      {/* Warm haze at the dead end — zero light cost, pure depth cue. */}
      <mesh
        material={prisonMaterials.farGlow}
        position={[
          ATMOSPHERE.farGlow.position[0],
          ATMOSPHERE.farGlow.position[1],
          ATMOSPHERE.farGlow.position[2],
        ]}
      >
        <planeGeometry args={[ATMOSPHERE.farGlow.scale[0], ATMOSPHERE.farGlow.scale[1]]} />
      </mesh>
      {/* Cool mid-corridor haze — middle layer between gate and dead end. */}
      <mesh
        material={prisonMaterials.midHaze}
        position={[
          ATMOSPHERE.midHaze.position[0],
          ATMOSPHERE.midHaze.position[1],
          ATMOSPHERE.midHaze.position[2],
        ]}
      >
        <planeGeometry args={[ATMOSPHERE.midHaze.scale[0], ATMOSPHERE.midHaze.scale[1]]} />
      </mesh>
      {/* Distant electrical fixture (cool strip on the dead-end wall). */}
      <mesh
        material={prisonMaterials.coolFixture}
        position={[
          ATMOSPHERE.coolFixture.position[0],
          ATMOSPHERE.coolFixture.position[1],
          ATMOSPHERE.coolFixture.position[2],
        ]}
      >
        <planeGeometry args={[ATMOSPHERE.coolFixture.scale[0], ATMOSPHERE.coolFixture.scale[1]]} />
      </mesh>
    </>
  );
}
