// HTML Components
import { Badge } from "@/components/ui/badge";

// Components
import { StatCards } from "@/components/leads/StatCards";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { LeadsHeaderActions } from "@/components/leads/LeadsHeaderActions";

// Libs
import { listLeads } from "@/lib/queries/leads";

// Types
import type { LeadListItem } from "@/types/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leadRows = await listLeads();

  const leads: LeadListItem[] = leadRows.map((lead) => ({
    id: lead.id,
    businessName: lead.businessName,
    city: lead.city,
    category: lead.category,
    email: lead.email,
    websiteUrl: lead.websiteUrl,
    source: lead.source,
    status: lead.status,
    qualificationScore: lead.qualificationScore,
    disqualifiedReason: lead.disqualifiedReason,
    failureReason: lead.failureReason,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }));

  const count = (predicate: (l: LeadListItem) => boolean) =>
    leads.filter(predicate).length;
  const stats = [
    {
      label: "Total leads",
      value: leads.length,
      delta: { value: "12%", positive: true },
      series: [4, 6, 5, 8, 7, 10, 9, leads.length || 11],
    },
    {
      label: "Qualified",
      value: count(
        (l) => l.qualificationScore !== null && l.status !== "disqualified",
      ),
      delta: { value: "4%", positive: true },
      series: [2, 3, 3, 4, 5, 4, 6, 7],
    },
    {
      label: "Drafted",
      value: count((l) =>
        ["drafted", "approved", "draft_created"].includes(l.status),
      ),
      delta: { value: "8%", positive: true },
      series: [1, 1, 2, 2, 3, 3, 4, 5],
    },
    {
      label: "Needs review",
      value: count((l) => l.status === "drafted"),
      delta: { value: "2%", positive: false },
      series: [3, 4, 3, 2, 3, 2, 2, 1],
    },
  ];

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-foreground">Leads</h1>
          <Badge
            variant="secondary"
            className="rounded-full font-normal text-muted-foreground"
          >
            {leads.length}
          </Badge>
        </div>
        <LeadsHeaderActions />
      </div>

      <StatCards stats={stats} />
      <LeadsTable leads={leads} />
    </main>
  );
}
