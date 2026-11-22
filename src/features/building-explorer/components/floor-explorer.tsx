"use client";

import { useMemo } from "react";

import type { Building } from "@/domain/types";
import type { FloorInfo } from "@/three";

import type { FloorSummary } from "../floor-summary";
import { BuildingViewer3D } from "./building-viewer-3d";
import { FloorPicker } from "./floor-picker";
import { useFloorUrl } from "../hooks/use-floor-url";
import { useExplorerStore } from "../store";

interface FloorExplorerProps {
  projectName: string;
  building: Building;
  floors: readonly FloorSummary[];
}

/** The 3D building and the floor list, sharing hover and selection through the explorer store. */
export function FloorExplorer({ projectName, building, floors }: FloorExplorerProps) {
  const hoveredFloorId = useExplorerStore((s) => s.hoveredFloorId);
  const selectedFloorId = useExplorerStore((s) => s.selectedFloorId);
  const { hoverFloor, selectFloor } = useExplorerStore.getState();

  useFloorUrl(floors, selectedFloorId, selectFloor);

  const floorInfo = useMemo(
    () =>
      Object.fromEntries(
        floors.map((f) => [f.id, { label: f.label, available: f.counts.available }]),
      ) as Record<string, FloorInfo>,
    [floors],
  );

  const toggle = (floorId: string) => selectFloor(floorId === selectedFloorId ? null : floorId);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <BuildingViewer3D
        building={building}
        label={`3D model of ${projectName}. Use the floor list to choose a floor.`}
        floorInfo={floorInfo}
        hoveredFloorId={hoveredFloorId}
        selectedFloorId={selectedFloorId}
        onFloorHover={hoverFloor}
        onFloorSelect={toggle}
      />
      <FloorPicker
        floors={floors}
        selectedFloorId={selectedFloorId}
        hoveredFloorId={hoveredFloorId}
        onSelect={toggle}
        onHover={hoverFloor}
      />
    </div>
  );
}
