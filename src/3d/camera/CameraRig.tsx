// ============================================================================
// CAMERA RIG — the single owner of camera movement AND the animation clock.
// ----------------------------------------------------------------------------s
// This is the only component that calls `controller.tick(dt)`. Every other
// system (gate, reveal, lights) reads the same clamped clock, so the
// whole intro runs on ONE unified delta-driven loop with no React state per
// frame and no competing requestAnimationFrame / GSAP ticker.
// ============================================================================

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { IntroController } from "../intro/IntroController";
import { CAMERA_DAMPING, aspectAdjustedFov } from "./cameraConfig";

interface CameraRigProps {
  controller: IntroController;
  onSequenceComplete: () => void;
}

// Reused per-frame scratch objects — zero allocation in the loop.
const desiredTarget = new THREE.Vector3();

export function CameraRig({ controller, onSequenceComplete }: CameraRigProps) {
  // Look-at point is damped separately from position so pans feel organic.
  const smoothTarget = useMemo(() => new THREE.Vector3(0, 1.52, 0), []);
  const notified = useRef(false);

  useFrame((state, delta) => {
    // ── 1. The clock. Clamp protects against tab-switch / long-frame spikes.
    const dt = Math.min(delta, 0.05);
    controller.tick(dt);

    const camera = state.camera;
    const pose = controller.player.pose;

    // ── 2. Look-at target comes straight from the shot's own curve.
    desiredTarget.copy(pose.target);

    // ── 3. Exponential damping of position / target / fov.
    const posAlpha = 1 - Math.exp(-CAMERA_DAMPING.position * dt);
    camera.position.lerp(pose.position, posAlpha);

    const targetAlpha = 1 - Math.exp(-CAMERA_DAMPING.target * dt);
    smoothTarget.lerp(desiredTarget, targetAlpha);
    camera.lookAt(smoothTarget);

    const perspective = camera as THREE.PerspectiveCamera;
    const aspect = state.size.width / Math.max(1, state.size.height);
    const desiredFov = aspectAdjustedFov(pose.fov, aspect);
    if (Math.abs(perspective.fov - desiredFov) > 0.01) {
      const fovAlpha = 1 - Math.exp(-CAMERA_DAMPING.fov * dt);
      perspective.fov += (desiredFov - perspective.fov) * fovAlpha;
      perspective.updateProjectionMatrix();
    }

    // ── 4. Discrete completion event (fires once, either naturally or after
    //       a skip). One React state update for the whole sequence.
    if (controller.completed && !notified.current) {
      notified.current = true;
      onSequenceComplete();
    }
  });

  return null;
}
