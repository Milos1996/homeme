"use client";

import { useEffect, useRef } from "react";

import type { Availability } from "@/domain/types";

import { buildExplorerSearch, parseExplorerSearch } from "../explorer-url";
import type { FloorSummary } from "../floor-summary";

interface Sync {
  floors: readonly FloorSummary[];
  selectedFloorId: string | null;
  availability: Availability[];
  rooms: number[];
  apply: (state: { floorId: string | null; availability: Availability[]; rooms: number[] }) => void;
}

/**
 * Mirrors the selected floor and filters in the URL. Reads them once on
 * mount (so a shared link or "Back" restores the view), then writes changes
 * with `history.replaceState`: no server round trip and no extra history
 * entries, so "Back" from an apartment lands on this exact state.
 */
export function useExplorerUrl({ floors, selectedFloorId, availability, rooms, apply }: Sync) {
  const hydrated = useRef(false);

  useEffect(() => {
    apply(parseExplorerSearch(window.location.search, floors));
    hydrated.current = true;
  }, [floors, apply]);

  useEffect(() => {
    if (!hydrated.current) return;
    const search = buildExplorerSearch(
      { floorId: selectedFloorId, availability, rooms },
      floors,
      window.location.search,
    );
    const url = `${window.location.pathname}${search}${window.location.hash}`;
    if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(window.history.state, "", url);
    }
  }, [floors, selectedFloorId, availability, rooms]);
}
