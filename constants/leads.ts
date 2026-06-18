// Types
import type { LeadStatus } from "@/lib/queries/leads";

export const LEAD_STATUS_META: Record<LeadStatus, { label: string; tone: string }> = {
  new: { label: "New", tone: "bg-sky-50 text-sky-700" },
  auditing: { label: "Auditing", tone: "bg-blue-50 text-blue-700" },
  qualified: { label: "Qualified", tone: "bg-emerald-50 text-emerald-700" },
  disqualified: { label: "Disqualified", tone: "bg-zinc-100 text-zinc-500" },
  drafting: { label: "Drafting", tone: "bg-amber-50 text-amber-700" },
  drafted: { label: "Drafted", tone: "bg-indigo-50 text-indigo-700" },
  approved: { label: "Approved", tone: "bg-emerald-50 text-emerald-700" },
  draft_created: { label: "Gmail draft", tone: "bg-emerald-50 text-emerald-700" },
  replied: { label: "Replied", tone: "bg-violet-50 text-violet-700" },
  archived: { label: "Archived", tone: "bg-zinc-100 text-zinc-500" },
  failed: { label: "Failed", tone: "bg-red-50 text-red-700" },
};

export const MAX_LEADS_PER_RUN = 50;