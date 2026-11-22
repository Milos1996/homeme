import { describe, expect, it } from "vitest";

import { material } from "./materials";
import { scenePalette } from "./palette";

describe("material library", () => {
  it("returns one shared instance per key", () => {
    expect(material("plaster")).toBe(material("plaster"));
    expect(material("plaster")).not.toBe(material("facade"));
  });

  it("uses the scene palette", () => {
    expect(`#${material("oak").color.getHexString()}`).toBe(scenePalette.floor);
    expect(material("glass").roughness).toBeLessThan(0.2);
    expect(material("glass").name).toBe("glass");
  });
});
