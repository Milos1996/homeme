import { describe, expect, it } from "vitest";

import { formatArea, formatLength, formatPrice, formatRooms } from "./format";

describe("format helpers", () => {
  it("prefixes estimates with ~ and leaves verified values plain", () => {
    expect(formatArea({ value: 54.5, unit: "m2", provenance: "estimated" })).toBe("~54.5 m²");
    expect(formatArea({ value: 54.5, unit: "m2", provenance: "verified" })).toBe("54.5 m²");
    expect(formatLength({ value: 3.2, unit: "m", provenance: "estimated" })).toBe("~3.20 m");
    expect(formatLength({ value: 3.2, unit: "m", provenance: "verified" })).toBe("3.20 m");
  });

  it("formats prices without decimals", () => {
    expect(formatPrice({ amount: 245000, currency: "EUR" })).toBe("€245,000");
  });

  it("labels one room as a studio", () => {
    expect(formatRooms(1)).toBe("Studio");
    expect(formatRooms(3)).toBe("3 rooms");
  });
});
