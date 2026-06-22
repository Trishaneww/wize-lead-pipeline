// Libs
import { describe, expect, it } from "vitest";
import {
  OutreachDraftSchema,
  QualificationResultSchema,
} from "@/lib/anthropic";
import {
  ingestRequestedData,
  leadInputSchema,
  placesSourceRequestedData,
} from "@/constants/events";

describe("QualificationResultSchema", () => {
  const valid = {
    qualified: true,
    score: 80,
    reasoning: "x",
    suggested_angle: "y",
  };
  it("accepts a valid result", () => {
    expect(QualificationResultSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects out-of-range / non-int score and empty strings", () => {
    expect(QualificationResultSchema.safeParse({ ...valid, score: 120 }).success).toBe(false);
    expect(QualificationResultSchema.safeParse({ ...valid, score: 50.5 }).success).toBe(false);
    expect(QualificationResultSchema.safeParse({ ...valid, reasoning: "" }).success).toBe(false);
  });
});

describe("OutreachDraftSchema", () => {
  it("requires non-empty subject and body", () => {
    expect(OutreachDraftSchema.safeParse({ subject: "Hi", body: "Yo" }).success).toBe(true);
    expect(OutreachDraftSchema.safeParse({ subject: "", body: "Yo" }).success).toBe(false);
  });
});

describe("event schemas", () => {
  it("leadInputSchema requires businessName", () => {
    expect(leadInputSchema.safeParse({ businessName: "Biz" }).success).toBe(true);
    expect(leadInputSchema.safeParse({ websiteUrl: "x" }).success).toBe(false);
  });

  it("ingestRequestedData defaults source and rejects an empty businesses array", () => {
    const r = ingestRequestedData.safeParse({
      channel: "web_design",
      businesses: [{ businessName: "B" }],
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.source).toBe("manual");
    expect(
      ingestRequestedData.safeParse({ channel: "web_design", businesses: [] }).success,
    ).toBe(false);
  });

  it("placesSourceRequestedData defaults channel and caps limit at 20", () => {
    const r = placesSourceRequestedData.safeParse({ niche: "dentist", city: "Hamilton" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.channel).toBe("web_design");
    expect(
      placesSourceRequestedData.safeParse({ niche: "d", city: "c", limit: 50 }).success,
    ).toBe(false);
  });
});
