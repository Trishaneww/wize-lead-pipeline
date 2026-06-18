// Types
import type { LeadRow, LeadStatus } from "@/lib/queries/leads";
import { AuditFinding } from "./audits";

export type LeadListItem = {
  id: string;
  businessName: string;
  city: string | null;
  category: string | null;
  email: string | null;
  websiteUrl: string | null;
  source: LeadRow["source"];
  status: LeadStatus;
  qualificationScore: number | null;
  disqualifiedReason: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DetailLead = {
  id: string;
  businessName: string;
  status: LeadStatus;
  email: string | null;
  city: string | null;
  category: string | null;
  websiteUrl: string | null;
  qualificationScore: number | null;
  disqualifiedReason: string | null;
  failureReason: string | null;
};

export type DetailAudit = {
  reachable: boolean;
  performanceScore: number | null;
  findings: AuditFinding[];
  screenshotDataUrl: string | null;
} | null;

export type DetailDraft = {
  id: string;
  subject: string;
  body: string;
  status: string;
} | null;

export type { LeadStatus };
