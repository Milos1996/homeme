"use client";

import { useCallback, useMemo } from "react";

import type { Building } from "@/domain/types";
import type { FloorInfo } from "@/three";

import type { FloorSummary, UnitSummary } from "../floor-summary";
import { ApartmentPanel } from "./apartment-panel";
import { BuildingViewer3D } from "./building-viewer-3d";
import { FloorPicker } from "./floor-picker";
import { useExplorerUrl } from "../hooks/use-explorer-url";
import { useExplorerStore } from "../store";

interface FloorExplorerProps {
  projectSlug: string;
  projectName: string;
  building: Building;
  floors: readonly FloorSummary[];
  units: readonly UnitSummary[];
}

/** The 3D building and the floor list, sharing hover and selection through the explorer store. */
export function FloorExplorer({
  projectSlug,
  projectName,
  building,
  floors,
  units,
}: FloorExplorerProps) {
  const hoveredFloorId = useExplorerStore((s) => s.hoveredFloorId);
  const selectedFloorId = useExplorerStore((s) => s.selectedFloorId);
  const availabilityFilter = useExplorerStore((s) => s.availabilityFilter);
  const roomFilter = useExplorerStore((s) => s.roomFilter);
  const { hoverFloor, selectFloor, setAvailabilityFilter, setRoomFilter, clearFilters } =
    useExplorerStore.getState();

  const apply = useCallback(
    (s: { floorId: string | null; availability: typeof availabilityFilter; rooms: number[] }) => {
      selectFloor(s.floorId);
      setAvailabilityFilter(s.availability);
      setRoomFilter(s.rooms);
    },
    [selectFloor, setAvailabilityFilter, setRoomFilter],
  );
  useExplorerUrl({
    floors,
    selectedFloorId,
    availability: availabilityFilter,
    rooms: roomFilter,
    apply,
  });

  const floorInfo = useMemo(
    () =>
      Object.fromEntries(
        floors.map((f) => [f.id, { label: f.label, available: f.counts.available }]),
      ) as Record<string, FloorInfo>,
    [floors],
  );

  const toggle = (floorId: string) => selectFloor(floorId === selectedFloorId ? null : floorId);

  const selectedFloor = floors.find((f) => f.id === selectedFloorId) ?? null;

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
      <div className="lg:col-span-2">
        <ApartmentPanel
          floor={selectedFloor}
          units={units}
          availabilityFilter={availabilityFilter}
          roomFilter={roomFilter}
          onAvailabilityFilterChange={setAvailabilityFilter}
          onRoomFilterChange={setRoomFilter}
          onClearFilters={clearFilters}
          unitHref={(unitId) => `/projects/${projectSlug}/apartments/${unitId}`}
        />
      </div>
    </div>
  );
}
