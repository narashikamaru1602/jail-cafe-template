import { Canvas } from "@react-three/fiber";
import { forwardRef, Suspense, useImperativeHandle, useMemo } from "react";
import { INITIAL_CAMERA } from "../3d/camera/cameraConfig";
import { INTRO_SEQUENCE } from "../3d/cinematic/sequence.config";
import { JailScene } from "../3d/JailScene";
import { IntroController } from "../3d/intro/IntroController";
import { useQuality } from "../3d/performance/useQuality";

// Isolated in its own module (rather than inline in IntroExperience) purely
// so it can be code-split via React.lazy — three.js, @react-three/fiber,
// drei and the whole cinematic graph only get downloaded when we've actually
// decided to play the sequence, never for repeat visits / reduced-motion /
// low-end fallbacks, and never into the prerendered shell.

export interface JailDoorCanvasHandle {
  /** Hard-cuts the cinematic to its final pose (skip button). */
  skip: () => void;
}

interface JailDoorCanvasProps {
  /** Fires once the scene has really rendered (assets settled + 2 frames). */
  onReady: () => void;
  onSequenceComplete: () => void;
}

export const JailDoorCanvas = forwardRef<JailDoorCanvasHandle, JailDoorCanvasProps>(
  function JailDoorCanvas({ onReady, onSequenceComplete }, ref) {
    const quality = useQuality();
    // One controller (and therefore ONE animation clock) for the whole scene.
    const controller = useMemo(() => new IntroController(INTRO_SEQUENCE), []);

    useImperativeHandle(
      ref,
      () => ({
        skip: () => controller.skip(),
      }),
      [controller],
    );

    return (
      <Canvas
        className="!absolute inset-0"
        dpr={[1, quality.dprMax]}
        shadows={quality.shadows}
        gl={{
          antialias: quality.antialias,
          alpha: false,
          powerPreference: "high-performance",
        }}
        camera={{
          fov: INITIAL_CAMERA.fov,
          position: INITIAL_CAMERA.position,
          near: INITIAL_CAMERA.near,
          far: INITIAL_CAMERA.far,
        }}
        // Pixel-ratio headroom: drei's <AdaptiveDpr /> steps down toward this
        // floor if the device can't hold frame rate (mobile safety net).
        performance={{ min: 0.55 }}
      >
        <Suspense fallback={null}>
          <JailScene
            quality={quality}
            controller={controller}
            onReady={onReady}
            onSequenceComplete={onSequenceComplete}
          />
        </Suspense>
      </Canvas>
    );
  },
);
