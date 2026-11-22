import type { Availability } from "@/domain/types";

import type { FloorSummary } from "./floor-summary";

/** Explorer state that lives in the URL so it can be shared and restored on "Back". */
export interface ExplorerUrlState {
  readonly floorId: string | null;
  readonly availability: Availability[];
  readonly rooms: number[];
}

const AVAILABILITIES: readonly Availability[] = ["available", "reserved", "sold"];

const list = (value: string | null) => (value ? value.split(",").filter(Boolean) : []);

/** Reads `?floor=<level>&status=a,b&rooms=1,2`, ignoring anything unknown. */
export function parseExplorerSearch(
  search: string,
  floors: readonly Pick<FloorSummary, "id" | "level">[],
): ExplorerUrlState {
  const params = new URLSearchParams(search);
  const rawFloor = params.get("floor");
  const level = rawFloor === null || rawFloor === "" ? NaN : Number(rawFloor);
  return {
    floorId: floors.find((f) => f.level === level)?.id ?? null,
    availability: list(params.get("status")).filter((s): s is Availability =>
      AVAILABILITIES.includes(s as Availability),
    ),
    rooms: list(params.get("rooms"))
      .map(Number)
      .filter((n) => Number.isInteger(n) && n > 0),
  };
}

/** Writes explorer state into `search`, keeping unrelated params. Returns e.g. "?floor=3&status=available". */
export function buildExplorerSearch(
  state: ExplorerUrlState,
  floors: readonly Pick<FloorSummary, "id" | "level">[],
  search = "",
): string {
  const params = new URLSearchParams(search);
  const level = floors.find((f) => f.id === state.floorId)?.level;
  const set = (key: string, value: string | undefined) =>
    value ? params.set(key, value) : params.delete(key);

  set("floor", level === undefined ? undefined : String(level));
  set("status", state.availability.length ? state.availability.join(",") : undefined);
  set("rooms", state.rooms.length ? state.rooms.join(",") : undefined);

  const query = params.toString();
  return query ? `?${query}` : "";
}

/** Link to a project's explorer, optionally opened on a floor. */
export function explorerHref(projectSlug: string, level?: number): string {
  return `/projects/${projectSlug}${level === undefined ? "" : `?floor=${level}`}`;
}
