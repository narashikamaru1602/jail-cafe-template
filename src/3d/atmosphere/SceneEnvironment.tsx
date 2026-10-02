// ============================================================================
// SCENE ENVIRONMENT — procedural image-based lighting for the metals.
// ----------------------------------------------------------------------------
// Metalness without an environment map renders nearly black (metals have no
// diffuse term — they can only show what they reflect). The gate, bars,
// rivets and brass trim are all metals, so the scene generates a PMREM
// environment from three's MIT-licensed, fully PROCEDURAL RoomEnvironment:
//
//   * no network fetch, no external HDRI (licensing stays clean)
//   * generated once per Canvas, disposed on unmount
//   * `environmentIntensity` keeps it subtle — this is a dark prison set,
//     not a studio; the environment just stops metals reading as silhouettes
// ============================================================================

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

interface SceneEnvironmentProps {
  /** Global multiplier for the environment contribution (0..1). */
  intensity: number;
}

export function SceneEnvironment({ intensity }: SceneEnvironmentProps) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, 0.04);

    scene.environment = target.texture;
    scene.environmentIntensity = intensity;

    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      // RoomEnvironment owns ad-hoc geometry/materials — free them too.
      room.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const material = mesh.material;
        if (Array.isArray(material)) {
          material.forEach((entry) => entry.dispose());
        } else if (material) {
          material.dispose();
        }
      });
    };
  }, [gl, scene, intensity]);

  return null;
}
