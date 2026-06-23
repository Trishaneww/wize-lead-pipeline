// Libs
import { describe, expect, it } from "vitest";
import { getScoreBarColors } from "@/lib/helpers/scoreBars";

const EMPTY = "#e5e7eb";

describe("getScoreBarColors", () => {
  it("returns 14 bars", () => {
    expect(getScoreBarColors(50)).toHaveLength(14);
  });

  it("is all-empty at score 0", () => {
    expect(getScoreBarColors(0).every((c) => c === EMPTY)).toBe(true);
  });

  it("is all-filled at score 100", () => {
    expect(getScoreBarColors(100).some((c) => c === EMPTY)).toBe(false);
  });

  it("fills half the bars at score 50", () => {
    const filled = getScoreBarColors(50).filter((c) => c !== EMPTY).length;
    expect(filled).toBe(7); // Math.round(0.5 * 14)
  });
});
