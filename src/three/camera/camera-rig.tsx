"use client";

import { CameraControls } from "@react-three/drei";
import { useEffect, useRef } from "react";

import type { CameraLimits, CameraMode, CameraPose } from "./presets";

interface CameraRigProps {
  mode: CameraMode;
  poses: Record<CameraMode, CameraPose>;
  limits: CameraLimits;
}

/**
 * Orbit controls with zoom and angle limits (never below the floor) that
 * glide between camera presets when `mode` changes.
 */
export function CameraRig({ mode, poses, limits }: CameraRigProps) {
  const controls = useRef<CameraControls>(null);
  const first = useRef(true);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const { position: p, target: t } = poses[mode];
    void c.setLookAt(p[0], p[1], p[2], t[0], t[1], t[2], !first.current);
    first.current = false;
  }, [mode, poses]);

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
