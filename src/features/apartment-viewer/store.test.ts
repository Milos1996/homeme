import { beforeEach, describe, expect, it } from "vitest";

import { useViewerStore } from "./store";

describe("viewer store", () => {
  beforeEach(() => useViewerStore.getState().reset());

  it("starts in 3D orbit view with nothing selected and furniture hidden", () => {
    expect(useViewerStore.getState()).toMatchObject({
      viewMode: "3d",
      cameraMode: "orbit",
      selectedRoomId: null,
      showFurniture: false,
    });
  });

  it("switches view and camera modes", () => {
    const s = useViewerStore.getState();
    s.setViewMode("2d");
    s.setCameraMode("top");
    expect(useViewerStore.getState()).toMatchObject({ viewMode: "2d", cameraMode: "top" });
  });

  it("toggles room selection and clears it", () => {
    const { toggleRoom, clearSelection } = useViewerStore.getState();
    toggleRoom("living");
    expect(useViewerStore.getState().selectedRoomId).toBe("living");
    toggleRoom("kitchen");
    expect(useViewerStore.getState().selectedRoomId).toBe("kitchen");
    toggleRoom("kitchen");
    expect(useViewerStore.getState().selectedRoomId).toBeNull();
    toggleRoom("living");
    clearSelection();
    expect(useViewerStore.getState().selectedRoomId).toBeNull();
  });

  it("toggles furniture and resets everything", () => {
    const s = useViewerStore.getState();
    s.setShowFurniture(true);
    s.setViewMode("2d");
    expect(useViewerStore.getState().showFurniture).toBe(true);
    s.reset();
    expect(useViewerStore.getState()).toMatchObject({ showFurniture: false, viewMode: "3d" });
  });
});
