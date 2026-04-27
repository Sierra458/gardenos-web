import { describe, it, expect } from "vitest";
import { buildSlugMap, resolveWikilink, WikilinkError } from "./wikilink";

const corpus = [
  { vaultPath: "Architecture/System Architecture.md", title: "System Architecture", slug: "/architecture/system-architecture" },
  { vaultPath: "Hardware/Raspberry Pi 5.md", title: "Raspberry Pi 5", slug: "/hardware/raspberry-pi-5" },
  { vaultPath: "Hardware/Arduino Mega.md", title: "Arduino Mega", slug: "/hardware/arduino-mega" },
];

describe("buildSlugMap", () => {
  it("indexes by title and lowercased title", () => {
    const map = buildSlugMap(corpus);
    expect(map.get("System Architecture")).toBe("/architecture/system-architecture");
    expect(map.get("system architecture")).toBe("/architecture/system-architecture");
  });
});

describe("resolveWikilink", () => {
  const map = buildSlugMap(corpus);

  it("resolves a plain wikilink target to slug", () => {
    expect(resolveWikilink("Raspberry Pi 5", map, "src.md")).toBe("/hardware/raspberry-pi-5");
  });

  it("is case-insensitive on the title", () => {
    expect(resolveWikilink("raspberry pi 5", map, "src.md")).toBe("/hardware/raspberry-pi-5");
  });

  it("preserves anchor when target includes #section", () => {
    expect(resolveWikilink("System Architecture#Data Flow", map, "src.md"))
      .toBe("/architecture/system-architecture#data-flow");
  });

  it("preserves nested section anchors when target has multiple #", () => {
    expect(resolveWikilink("System Architecture#Data Flow#Step 1", map, "src.md"))
      .toBe("/architecture/system-architecture#data-flow-step-1");
  });

  it("throws WikilinkError on broken target with source file context", () => {
    expect(() => resolveWikilink("Nonexistent", map, "Daily Log/2026-03-19 — Garden Monitor.md"))
      .toThrow(WikilinkError);
    expect(() => resolveWikilink("Nonexistent", map, "Daily Log/2026-03-19 — Garden Monitor.md"))
      .toThrow(/Daily Log\/2026-03-19/);
  });
});
