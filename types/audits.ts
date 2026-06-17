export type AuditSeverity = "critical" | "high" | "medium" | "low" | "info";

export type AuditFinding = {
  key: string;
  severity: AuditSeverity;
  description: string;
};

export type SiteSignals = {
  hasTapToCall: boolean;
  hasContactForm: boolean;
  hasOnlineBooking: boolean;
  ctaLabels: string[];
  mentionsReviews: boolean;
  socialLinks: string[];
  copyrightYear: number | null;
};

export type SiteAuditResult = {
  reachable: boolean;
  hasHttps: boolean;
  hasViewportMeta: boolean;
  mobileFriendly: boolean | null;
  performanceScore: number | null;
  lcpMs: number | null;
  cls: number | null;
  findings: AuditFinding[];
  signals: SiteSignals;
  siteSummary: string;
  visibleText: string;
  screenshotBase64: string | null;
  rawPagespeed: unknown;
};
