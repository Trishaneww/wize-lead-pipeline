// HTML Components
import { Badge } from "@/components/ui/badge";

// Components
import { StatCards } from "@/components/leads/StatCards";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { LeadsHeaderActions } from "@/components/leads/LeadsHeaderActions";

// Libs
import { listLeads } from "@/lib/queries/leads";
import { getDailyLeadCounts } from "@/lib/queries/stats";
import { buildStatCards } from "@/lib/helpers/stats";

// Types
import type { LeadListItem } from "@/types/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const [leadRows, daily] = await Promise.all([
    listLeads(),
    getDailyLeadCounts(),
  ]);

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

  const stats = buildStatCards(leads, daily);

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
