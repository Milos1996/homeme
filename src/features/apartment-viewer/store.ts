import { create } from "zustand";

import type { CameraMode } from "@/three";

export type ViewMode = "2d" | "3d";

export interface ViewerState {
  viewMode: ViewMode;
  cameraMode: CameraMode;
  selectedRoomId: string | null;
  showFurniture: boolean;
  setViewMode: (mode: ViewMode) => void;
  setCameraMode: (mode: CameraMode) => void;
  /** Selects a room, or clears the selection when the same room is chosen again. */
  toggleRoom: (roomId: string) => void;
  clearSelection: () => void;
  setShowFurniture: (show: boolean) => void;
  reset: () => void;
}

const initial = {
  viewMode: "3d" as ViewMode,
  cameraMode: "orbit" as CameraMode,
  selectedRoomId: null,
  showFurniture: false,
};

/** Shared state for the apartment viewer: both the 2D plan and the 3D scene read from it. */
export const useViewerStore = create<ViewerState>()((set) => ({
  ...initial,
  setViewMode: (viewMode) => set({ viewMode }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  toggleRoom: (roomId) =>
    set((s) => ({ selectedRoomId: s.selectedRoomId === roomId ? null : roomId })),
  clearSelection: () => set({ selectedRoomId: null }),
  setShowFurniture: (showFurniture) => set({ showFurniture }),
  reset: () => set(initial),
}));
