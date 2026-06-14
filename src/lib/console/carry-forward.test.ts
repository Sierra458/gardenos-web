import { describe, it, expect } from "vitest";
import { extractCarryForward } from "./carry-forward";

describe("extractCarryForward", () => {
  it("returns unchecked items from a carry-forward section", () => {
    const body = `## 🎯 Today's Focus
something

## 🔄 Carry Forward
- [ ] water tomatoes
- [x] done
- [ ] mulch okra

## After`;
    expect(extractCarryForward(body)).toEqual(["water tomatoes", "mulch okra"]);
  });

  it("returns empty when no section", () => {
    expect(extractCarryForward("# Title\nbody")).toEqual([]);
  });
});
