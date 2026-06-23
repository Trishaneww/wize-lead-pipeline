// Libs
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildStatCards, computeDelta } from "@/lib/helpers/stats";

// Types
import type { LeadListItem } from "@/types/leads";
import type { DailyLeadCount } from "@/lib/queries/stats";

const lead = (over: Partial<LeadListItem>): LeadListItem => ({
  id: "x",
  businessName: "Biz",
  city: null,
  category: null,
  email: null,
  websiteUrl: null,
  source: "places",
  status: "new",
  qualificationScore: null,
  disqualifiedReason: null,
  failureReason: null,
  createdAt: "2026-06-18T00:00:00.000Z",
  updatedAt: "2026-06-18T00:00:00.000Z",
  ...over,
});

const daily = (over: Partial<DailyLeadCount>): DailyLeadCount => ({
  date: "2026-06-18",
  total: 0,
  qualified: 0,
  drafted: 0,
  needsReview: 0,
  ...over,
});

describe("computeDelta", () => {
  it("returns a percentage when the prior half is non-zero", () => {
    // prior half (first 7) sums to 7, current half (last 7) sums to 14 → +100%
    const series = [1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2];
    expect(computeDelta(series)).toEqual({ value: "100%", positive: true });
  });

  it('returns "new" when prior is zero but current is positive', () => {
    const series = [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0];
    expect(computeDelta(series)).toEqual({ value: "new", positive: true });
  });

  it("returns undefined when both halves are zero", () => {
    expect(computeDelta(new Array(14).fill(0))).toBeUndefined();
  });

  it("marks a decline as not positive", () => {
    const series = [2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1];
    expect(computeDelta(series)).toEqual({ value: "-50%", positive: false });
  });
});

describe("buildStatCards", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-18T12:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("computes all-time values from the lead predicates", () => {
    const leads = [
      lead({ status: "new" }),
      lead({ status: "qualified", qualificationScore: 80 }),
      lead({ status: "drafted", qualificationScore: 70 }),
      lead({ status: "draft_created", qualificationScore: 90 }),
      lead({ status: "disqualified", qualificationScore: 20 }),
    ];
    const cards = buildStatCards(leads, []);
    const value = (label: string) =>
      cards.find((c) => c.label === label)?.value;
    expect(value("Total leads")).toBe(5);
    expect(value("Qualified")).toBe(3); // 80, 70, 90 (disqualified excluded)
    expect(value("Drafted")).toBe(2); // drafted + draft_created
    expect(value("Needs review")).toBe(1); // only "drafted"
  });

  it("gap-fills the series to exactly `days` points", () => {
    const cards = buildStatCards([], [daily({ date: "2026-06-18", total: 3 })]);
    const total = cards.find((c) => c.label === "Total leads");
    expect(total?.series).toHaveLength(14);
    // today's bucket is the last point; missing days are 0
    expect(total?.series.at(-1)).toBe(3);
    expect(total?.series.slice(0, 13).every((n) => n === 0)).toBe(true);
  });
});
