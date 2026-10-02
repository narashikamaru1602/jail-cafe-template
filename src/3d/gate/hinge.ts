// ============================================================================
// HINGE — outer-edge pivot construction for door/gate leaves.
// ----------------------------------------------------------------------------s
// Technique reference: the `doorPivotSetup` bounding-box hinge algorithm from
// the "3D-MODEL-WEB-PAGE" reference repo (no license file found — NO code was
// copied; the mechanism is reimplemented from scratch in TypeScript):
//
//   1. measure the object's world-space bounding box
//   2. the pivot goes on the outer edge (min.x for a left-hinged leaf)
//   3. parent a pivot group at that point and offset the content by -pivot,
//      so the leaf rotates around its edge instead of its centre
//
// Works identically for procedural geometry (used by JailGate today) and for
// a GLB leaf dropped in later — the pivot math does not care where the mesh
// came from.
// ============================================================================

import * as THREE from "three";

export type HingeEdge = "left" | "right";

export interface HingeSetup {
  /** World-space position the hinge group must sit at. */
  readonly pivot: THREE.Vector3;
  /** Offset to apply to the content so it keeps its authored position. */
  readonly contentOffset: THREE.Vector3;
}

export function computeHingeOffset(box: THREE.Box3, edge: HingeEdge): THREE.Vector3 {
  const center = box.getCenter(new THREE.Vector3());
  const x = edge === "left" ? box.min.x : box.max.x;
  return new THREE.Vector3(x, center.y, center.z);
}

/**
 * Returns the pivot for the given bounding box plus the compensating offset
 * for the leaf content (content keeps gate-space coordinates; the hinge group
 * then rotates the whole subtree around the pivot).
 */
export function createHingeSetup(box: THREE.Box3, edge: HingeEdge): HingeSetup {
  const pivot = computeHingeOffset(box, edge);
  return {
    pivot,
    contentOffset: pivot.clone().multiplyScalar(-1),
  };
}
