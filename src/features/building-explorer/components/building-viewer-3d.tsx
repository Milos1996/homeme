"use client";

import { WebGLFallback } from "@/components/common/webgl-fallback";
import type { Building } from "@/domain/types";
import { cn } from "@/lib/utils";
import { LazyBuildingCanvas, SceneLoading, useWebGLSupport } from "@/three";
import type { FloorInfo } from "@/three";

interface BuildingViewer3DProps {
  building: Building;
  /** Accessible description, e.g. "3D model of Linden Court". */
  label: string;
  floorInfo?: Readonly<Record<string, FloorInfo>>;
  hoveredFloorId?: string | null;
  selectedFloorId?: string | null;
  onFloorHover?: (floorId: string | null) => void;
  onFloorSelect?: (floorId: string) => void;
  className?: string;
}

/** Interactive 3D model of the whole building. */
export function BuildingViewer3D({ className, ...scene }: BuildingViewer3DProps) {
  const webgl = useWebGLSupport();

  return (
    <div
      data-testid="building-viewer-3d"
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-stone-100 md:aspect-[16/9]",
        className,
      )}
    >
      {webgl === null && <SceneLoading />}
      {webgl === false && <WebGLFallback alternative="The floor list shows every level." />}
      {webgl && <LazyBuildingCanvas {...scene} />}
    </div>
  );
}
