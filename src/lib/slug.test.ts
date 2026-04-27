import { describe, it, expect } from "vitest";
import { vaultPathToSiteSlug } from "./slug";

describe("vaultPathToSiteSlug", () => {
  const cases: Array<[string, string]> = [
    ["Garden Monitor.md", "/"],
    ["Architecture/System Architecture.md", "/architecture/system-architecture"],
    ["Architecture/Outdoor Watering System.md", "/architecture/outdoor-watering-system"],
    ["Hardware/Raspberry Pi 5.md", "/hardware/raspberry-pi-5"],
    ["Hardware/Arduino Mega.md", "/hardware/arduino-mega"],
    ["Software/Pi 5 Setup Guide.md", "/software/pi-5-setup-guide"],
    ["Daily Log/2026-03-19 — Garden Monitor.md", "/log/2026-03-19"],
    ["Daily Log/2026-03-18 — Garden Monitor.md", "/log/2026-03-18"],
  ];
  for (const [vault, expected] of cases) {
    it(`maps ${vault} → ${expected}`, () => {
      expect(vaultPathToSiteSlug(vault)).toBe(expected);
    });
  }

  it("strips em-dash, en-dash, and curly quotes from slug", () => {
    expect(vaultPathToSiteSlug("Architecture/Foo — Bar.md")).toBe("/architecture/foo-bar");
  });

  it("returns null for files outside the known top-level folders", () => {
    expect(vaultPathToSiteSlug("Research/Paper.md")).toBe(null);
    expect(vaultPathToSiteSlug("Templates/Daily.md")).toBe(null);
  });
});
