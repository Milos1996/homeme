"use client";

import dynamic from "next/dynamic";

import { SceneLoading } from "./scene-loading";

/**
 * Client-only apartment 3D view. three.js, R3F and the scene are split
 * into their own chunk and only load in the browser.
 */
export const LazyApartmentCanvas = dynamic(() => import("./scenes/apartment-canvas"), {
  ssr: false,
  loading: () => <SceneLoading />,
});
