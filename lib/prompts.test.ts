// Libs
import { describe, expect, it } from "vitest";
import { buildDraftPrompt, buildQualifyPrompt } from "@/lib/prompts";
import { EMPTY_SIGNALS } from "@/constants/audit";

// Types
import type { SiteAuditResult } from "@/types/audits";

const audit: SiteAuditResult = {
  reachable: true,
  hasHttps: true,
  hasViewportMeta: true,
  mobileFriendly: true,
  performanceScore: 80,
  lcpMs: 1500,
  cls: 0.1,
  findings: [],
  signals: EMPTY_SIGNALS,
  siteSummary: "Acme — dentist",
  visibleText: "welcome",
  screenshotBase64: null,
  rawPagespeed: null,
};

const lead = {
  businessName: "Acme Dental",
  city: "Hamilton",
  category: "dentist",
  websiteUrl: "https://acme.ca",
};

describe("buildQualifyPrompt", () => {
  it("puts agency/channel context in system and the lead in user", () => {
    const { system, user } = buildQualifyPrompt({
      channel: "web_design",
      lead,
      audit,
    });
    expect(system).toContain("Wize Studios");
    expect(user).toContain("Acme Dental");
    expect(user).toContain("dentist");
  });
});

describe("buildDraftPrompt", () => {
  it("puts the signature in system and angle/reasoning in user", () => {
    const { system, user } = buildDraftPrompt({
      channel: "web_design",
      lead,
      audit,
      angle: "your homepage buries the phone number",
      qualificationReasoning: "strong reviews, weak site",
    });
    expect(system).toContain("Trishane Anthony");
    expect(user).toContain("your homepage buries the phone number");
    expect(user).toContain("strong reviews, weak site");
  });
});
