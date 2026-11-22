import type { Area, Length, Price } from "@/domain/types";

const LOCALE = "en-GB";

/**
 * Formats an area, e.g. "54.5 m²". Estimated values are prefixed with "~"
 * so an estimate can never be mistaken for a verified figure.
 */
export function formatArea(area: Area): string {
  const value = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 }).format(area.value);
  return `${area.provenance === "estimated" ? "~" : ""}${value} m²`;
}

/** Formats a length in metres, e.g. "3.20 m", with "~" for estimates. */
export function formatLength(length: Length): string {
  const value = new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(length.value);
  return `${length.provenance === "estimated" ? "~" : ""}${value} m`;
}

/** Formats a price without decimals, e.g. "€245,000". */
export function formatPrice(price: Price): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: price.currency,
    maximumFractionDigits: 0,
  }).format(price.amount);
}

/** "Studio" for one room, otherwise "N rooms". */
export function formatRooms(rooms: number): string {
  return rooms === 1 ? "Studio" : `${rooms} rooms`;
}
