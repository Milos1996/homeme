"use client";

import { Box, ScanLine, Sofa } from "lucide-react";

import { WebGLFallback } from "@/components/common/webgl-fallback";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { FloorPlan } from "@/domain/types";
import { cn } from "@/lib/utils";
import { LazyApartmentCanvas, SceneLoading, useWebGLSupport } from "@/three";
import type { CameraMode } from "@/three";

interface ApartmentViewer3DProps {
  plan: FloorPlan;
  /** Accessible description of the scene, e.g. "3D model of apartment 0.01". */
  label: string;
  cameraMode: CameraMode;
  onCameraModeChange: (mode: CameraMode) => void;
  showFurniture?: boolean;
  onShowFurnitureChange?: (show: boolean) => void;
  highlightedRoomId?: string | null;
  onRoomSelect?: (roomId: string) => void;
  className?: string;
}

/** Interactive 3D model of an apartment with orbit and top-down camera presets (controlled). */
export function ApartmentViewer3D({
  plan,
  label,
  cameraMode,
  onCameraModeChange,
  showFurniture = false,
  onShowFurnitureChange,
  highlightedRoomId = null,
  onRoomSelect,
  className,
}: ApartmentViewer3DProps) {
  const webgl = useWebGLSupport();

  return (
    <div
      data-testid="apartment-viewer-3d"
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-stone-100",
        className,
      )}
    >
      {webgl === null && <SceneLoading />}

      {webgl === false && <WebGLFallback alternative="The 2D floor plan shows the same layout." />}

      {webgl && (
        <>
          <LazyApartmentCanvas
            label={label}
            plan={plan}
            cameraMode={cameraMode}
            showFurniture={showFurniture}
            highlightedRoomId={highlightedRoomId}
            {...(onRoomSelect ? { onRoomSelect } : {})}
          />

          <div className="absolute top-4 right-4 flex items-center gap-2">
            {onShowFurnitureChange && (plan.furniture?.length ?? 0) > 0 && (
              <Toggle
                pressed={showFurniture}
                onPressedChange={onShowFurnitureChange}
                aria-label="Show furniture"
                className="rounded-full bg-paper/90 px-3 shadow-soft backdrop-blur-sm data-[state=on]:bg-forest-700 data-[state=on]:text-warm-white"
              >
                <Sofa aria-hidden />
                <span className="text-xs">Furniture</span>
              </Toggle>
            )}
            <ToggleGroup
              type="single"
              value={cameraMode}
              onValueChange={(v) => v && onCameraModeChange(v as CameraMode)}
              aria-label="Camera view"
              className="rounded-full bg-paper/90 p-1 shadow-soft backdrop-blur-sm"
            >
              <ToggleGroupItem value="orbit" aria-label="3D view" className="rounded-full px-3">
                <Box aria-hidden />
                <span className="text-xs">3D</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="top" aria-label="Top-down view" className="rounded-full px-3">
                <ScanLine aria-hidden />
                <span className="text-xs">Top</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </>
      )}
    </div>
  );
}
