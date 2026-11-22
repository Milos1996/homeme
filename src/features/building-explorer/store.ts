import { create } from "zustand";

export interface ExplorerState {
  hoveredFloorId: string | null;
  selectedFloorId: string | null;
  hoverFloor: (floorId: string | null) => void;
  selectFloor: (floorId: string | null) => void;
  reset: () => void;
}

/** Shared state for the building explorer: the 3D building and the floor list both read it. */
export const useExplorerStore = create<ExplorerState>()((set) => ({
  hoveredFloorId: null,
  selectedFloorId: null,
  hoverFloor: (hoveredFloorId) => set({ hoveredFloorId }),
  selectFloor: (selectedFloorId) => set({ selectedFloorId }),
  reset: () => set({ hoveredFloorId: null, selectedFloorId: null }),
}));
