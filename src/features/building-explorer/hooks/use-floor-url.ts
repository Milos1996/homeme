"use client";

import { useEffect, useRef } from "react";

import type { FloorSummary } from "../floor-summary";

const PARAM = "floor";

/**
 * Keeps the selected floor in the URL as `?floor=<level>` so it can be shared.
 * Reads it once on mount, then mirrors changes with `history.replaceState`
 * (no server round trip, and no new history entry per click).
 */
export function useFloorUrl(
  floors: readonly FloorSummary[],
  selectedFloorId: string | null,
  selectFloor: (floorId: string | null) => void,
) {
  const hydrated = useRef(false);

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get(PARAM);
    const level = raw === null ? NaN : Number(raw);
    const match = floors.find((f) => f.level === level);
    selectFloor(match?.id ?? null);
    hydrated.current = true;
  }, [floors, selectFloor]);

  useEffect(() => {
    if (!hydrated.current) return;
    const url = new URL(window.location.href);
    const level = floors.find((f) => f.id === selectedFloorId)?.level;
    if (level === undefined) url.searchParams.delete(PARAM);
    else url.searchParams.set(PARAM, String(level));
    if (url.href !== window.location.href) window.history.replaceState(null, "", url);
  }, [floors, selectedFloorId]);
}
