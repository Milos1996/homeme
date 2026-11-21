"use client";

import { Box, Map as MapIcon } from "lucide-react";
import { useEffect, useMemo } from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { polygonArea } from "@/domain/geometry";
import { isFullyVerified } from "@/domain/selectors";
import type { FloorPlan } from "@/domain/types";
import { formatArea } from "@/lib/format";
import { cn } from "@/lib/utils";

import { useViewerStore, type ViewMode } from "../store";
import { ApartmentViewer3D } from "./apartment-viewer-3d";
import { FloorPlan2D } from "./floor-plan-2d";

interface ApartmentViewerProps {
  plan: FloorPlan;
  /** Human-facing unit number, used in accessible names. */
  apartmentNumber: string;
  className?: string;
}

/**
 * The 2D plan and 3D model of one apartment behind a single toggle.
 * Both views share the viewer store, so a room selected in one is
 * highlighted in the other. The 3D canvas is unmounted while 2D is shown.
 */
export function ApartmentViewer({ plan, apartmentNumber, className }: ApartmentViewerProps) {
  const viewMode = useViewerStore((s) => s.viewMode);
  const cameraMode = useViewerStore((s) => s.cameraMode);
  const selectedRoomId = useViewerStore((s) => s.selectedRoomId);
  const showFurniture = useViewerStore((s) => s.showFurniture);
  const { setViewMode, setCameraMode, toggleRoom, setShowFurniture, reset } =
    useViewerStore.getState();

  // Fresh state for each apartment.
  useEffect(() => reset(), [plan, reset]);

  const provenance = isFullyVerified(plan) ? "verified" : "estimated";
  const rooms = useMemo(
    () =>
      plan.rooms.map((room) => ({
        id: room.id,
        name: room.name,
        area: formatArea({ value: polygonArea(room.polygon), unit: "m2", provenance }),
      })),
    [plan, provenance],
  );

  return (
    <section
      aria-label={`Apartment ${apartmentNumber} plan and 3D model`}
      className={cn("flex flex-col gap-4", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => v && setViewMode(v as ViewMode)}
          aria-label="Plan view"
          variant="outline"
          className="rounded-full bg-paper p-1 shadow-soft"
        >
          <ToggleGroupItem value="2d" aria-label="2D floor plan" className="rounded-full px-4">
            <MapIcon aria-hidden />
            2D plan
          </ToggleGroupItem>
          <ToggleGroupItem value="3d" aria-label="3D model" className="rounded-full px-4">
            <Box aria-hidden />
            3D model
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div data-view-mode={viewMode}>
        {viewMode === "3d" ? (
          <ApartmentViewer3D
            plan={plan}
            label={`3D model of apartment ${apartmentNumber}`}
            cameraMode={cameraMode}
            onCameraModeChange={setCameraMode}
            showFurniture={showFurniture}
            onShowFurnitureChange={setShowFurniture}
            highlightedRoomId={selectedRoomId}
            onRoomSelect={toggleRoom}
          />
        ) : (
          <div className="rounded-3xl bg-card p-6 shadow-soft sm:p-10">
            <FloorPlan2D
              plan={plan}
              title={`Floor plan of apartment ${apartmentNumber}`}
              highlightedRoomId={selectedRoomId}
              onRoomSelect={toggleRoom}
            />
          </div>
        )}
      </div>

      <ul aria-label="Rooms" className="flex flex-wrap gap-2">
        {rooms.map((room) => {
          const selected = room.id === selectedRoomId;
          return (
            <li key={room.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => toggleRoom(room.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  selected
                    ? "border-forest-700 bg-forest-700 text-warm-white"
                    : "border-border bg-paper text-foreground hover:bg-accent",
                )}
              >
                {room.name}
                <span
                  className={cn("ml-2", selected ? "text-warm-white/80" : "text-muted-foreground")}
                >
                  {room.area}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
