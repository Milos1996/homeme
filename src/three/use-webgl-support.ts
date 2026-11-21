"use client";

import { useSyncExternalStore } from "react";

let cached: boolean | undefined;

/** True when the browser can create a WebGL context. Cached after the first check. */
export function detectWebGL(): boolean {
  if (cached !== undefined) return cached;
  try {
    const canvas = document.createElement("canvas");
    cached = !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    cached = false;
  }
  return cached;
}

const subscribe = () => () => {};

/** `null` during server rendering, then whether WebGL is available. */
export function useWebGLSupport(): boolean | null {
  return useSyncExternalStore(subscribe, detectWebGL, () => null);
}
