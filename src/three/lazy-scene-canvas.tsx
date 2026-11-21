"use client";

import dynamic from "next/dynamic";

import { SceneLoading } from "./scene-loading";

/**
 * Client-only R3F canvas. WebGL can't render on the server, so the canvas
 * and three.js are code-split and loaded in the browser with a styled
 * loading state. Use this in features instead of `<Canvas>`.
 */
export const LazySceneCanvas = dynamic(() => import("./scene-canvas"), {
  ssr: false,
  loading: () => <SceneLoading />,
});
