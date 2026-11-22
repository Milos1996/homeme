import { create } from "zustand";

import type { Availability } from "@/domain/types";

export interface ExplorerState {
  hoveredFloorId: string | null;
  selectedFloorId: string | null;
  /** Empty arrays mean "no filter". */
  availabilityFilter: Availability[];
  roomFilter: number[];
  hoverFloor: (floorId: string | null) => void;
  selectFloor: (floorId: string | null) => void;
  setAvailabilityFilter: (values: Availability[]) => void;
  setRoomFilter: (values: number[]) => void;
  clearFilters: () => void;
  reset: () => void;
}

const initial = {
  hoveredFloorId: null,
  selectedFloorId: null,
  availabilityFilter: [] as Availability[],
  roomFilter: [] as number[],
};

/** Shared state for the building explorer: the 3D building, floor list and unit panel read it. */
export const useExplorerStore = create<ExplorerState>()((set) => ({
  ...initial,
  hoverFloor: (hoveredFloorId) => set({ hoveredFloorId }),
  selectFloor: (selectedFloorId) => set({ selectedFloorId }),
  setAvailabilityFilter: (availabilityFilter) => set({ availabilityFilter }),
  setRoomFilter: (roomFilter) => set({ roomFilter }),
  clearFilters: () => set({ availabilityFilter: [], roomFilter: [] }),
  reset: () => set(initial),
}));
