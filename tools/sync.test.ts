import { describe, it, expect } from "vitest";
import { discoverPublishedNotes, mapVaultPathToContentPath } from "./sync";
import path from "node:path";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

function makeFakeVault() {
  const dir = mkdtempSync(path.join(tmpdir(), "vault-"));
  mkdirSync(path.join(dir, "Architecture"), { recursive: true });
  mkdirSync(path.join(dir, "Hardware"), { recursive: true });
  mkdirSync(path.join(dir, "Daily Log"), { recursive: true });
  writeFileSync(path.join(dir, "Garden Monitor.md"), `---\npublish: true\ntitle: GardenOS\ndate: 2026-03-18\n---\nWelcome.\n`);
  writeFileSync(path.join(dir, "Architecture/System Architecture.md"), `---\npublish: true\ntitle: System Architecture\ndate: 2026-03-18\n---\nBody.\n`);
  writeFileSync(path.join(dir, "Hardware/Raspberry Pi 5.md"), `---\npublish: true\ntitle: Raspberry Pi 5\ndate: 2026-03-18\n---\nHub.\n`);
  writeFileSync(path.join(dir, "Hardware/Arduino Mega.md"), `---\ntitle: Arduino Mega\n---\nNot published.\n`);
  writeFileSync(path.join(dir, "Daily Log/2026-03-19 — Garden Monitor.md"), `---\npublish: true\ntitle: Pi 5 first boot\ndate: 2026-03-19\n---\nLog.\n`);
  return dir;
}

describe("mapVaultPathToContentPath", () => {
  it("places root overview at index.md", () => {
    expect(mapVaultPathToContentPath("Garden Monitor.md")).toBe("index.md");
  });
  it("places architecture notes under architecture/", () => {
    expect(mapVaultPathToContentPath("Architecture/System Architecture.md")).toBe("architecture/system-architecture.md");
  });
  it("places hardware notes under hardware/", () => {
    expect(mapVaultPathToContentPath("Hardware/Raspberry Pi 5.md")).toBe("hardware/raspberry-pi-5.md");
  });
  it("places daily logs under log/<date>.md", () => {
    expect(mapVaultPathToContentPath("Daily Log/2026-03-19 — Garden Monitor.md")).toBe("log/2026-03-19.md");
  });
});

describe("discoverPublishedNotes", () => {
  it("returns only publish:true notes", async () => {
    const vault = makeFakeVault();
    try {
      const notes = await discoverPublishedNotes(vault);
      const titles = notes.map(n => n.title).sort();
      expect(titles).toEqual(["GardenOS", "Pi 5 first boot", "Raspberry Pi 5", "System Architecture"]);
    } finally {
      rmSync(vault, { recursive: true, force: true });
    }
  });
});
