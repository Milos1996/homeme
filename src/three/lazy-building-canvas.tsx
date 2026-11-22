"use client";

import dynamic from "next/dynamic";

import { SceneLoading } from "./scene-loading";

/** Client-only building 3D view: three.js, R3F and the scene load as one chunk in the browser. */
export const LazyBuildingCanvas = dynamic(() => import("./scenes/building-canvas"), {
  ssr: false,
  loading: () => <SceneLoading />,
});
