// Libs
import { describe, expect, it } from "vitest";
import { getPaginationRange } from "@/lib/helpers/pagination";

describe("getPaginationRange", () => {
  it("shows every page when there are 7 or fewer", () => {
    expect(getPaginationRange(0, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPaginationRange(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("ellipsizes the tail near the start", () => {
    expect(getPaginationRange(0, 10)).toEqual([1, 2, "ellipsis", 10]);
  });

  it("ellipsizes both sides in the middle", () => {
    expect(getPaginationRange(5, 10)).toEqual([
      1,
      "ellipsis",
      5,
      6,
      7,
      "ellipsis",
      10,
    ]);
  });

  it("ellipsizes the head near the end", () => {
    expect(getPaginationRange(9, 10)).toEqual([1, "ellipsis", 9, 10]);
  });
});
