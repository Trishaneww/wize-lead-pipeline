// Types
import type { Channel } from "@/constants/channels";
import type { SiteAuditResult } from "@/types/audits";

export type LeadInput = {
  businessName: string;
  websiteUrl?: string | null;
  city?: string | null;
  category?: string | null;
};

export type QualifyInput = {
  channel: Channel;
  lead: LeadInput;
  audit: SiteAuditResult;
};

export type DraftInput = {
  channel: Channel;
  lead: LeadInput;
  audit: SiteAuditResult;
  angle: string;
  qualificationReasoning: string;
};
