"use client";

import { CameraControls } from "@react-three/drei";
import { useEffect, useRef } from "react";

import type { CameraLimits, CameraPose } from "./presets";

interface CameraRigProps {
  /** Where the camera should be. Changing it glides the camera there. */
  pose: CameraPose;
  limits: CameraLimits;
}

/**
 * Orbit controls with zoom and angle limits (never below the floor) that
 * glide to a new pose whenever `pose` changes. The first pose is applied instantly.
 */
export function CameraRig({ pose, limits }: CameraRigProps) {
  const controls = useRef<CameraControls>(null);
  const first = useRef(true);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const { position: p, target: t } = pose;
    void c.setLookAt(p[0], p[1], p[2], t[0], t[1], t[2], !first.current);
    first.current = false;
  }, [pose]);

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={limits.minDistance}
      maxDistance={limits.maxDistance}
      minPolarAngle={0}
      maxPolarAngle={limits.maxPolarAngle}
      smoothTime={0.35}
    />
  );
}
