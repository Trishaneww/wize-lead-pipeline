// Next.js
import { notFound } from "next/navigation";

// Components
import { LeadDetail } from "@/components/leads/LeadDetail";

// Libs
import { getLeadById } from "@/lib/queries/leads";
import { latestAuditForLead } from "@/lib/queries/audits";
import { latestDraftForLead } from "@/lib/queries/drafts";

// Types
import type { DetailAudit, DetailDraft } from "@/types/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) notFound();

  const [auditRow, draftRow] = await Promise.all([
    latestAuditForLead(id),
    latestDraftForLead(id),
  ]);

  const audit: DetailAudit = auditRow
    ? {
        reachable: auditRow.reachable,
        performanceScore: auditRow.performanceScore,
        findings: auditRow.findings ?? [],
        screenshotDataUrl: auditRow.screenshotBase64
          ? `data:image/png;base64,${auditRow.screenshotBase64}`
          : null,
      }
    : null;

  const draft: DetailDraft = draftRow
    ? {
        id: draftRow.id,
        subject: draftRow.subject ?? "(no subject)",
        body: draftRow.editedBody ?? draftRow.body ?? "",
        status: draftRow.status,
      }
    : null;

  return (
    <LeadDetail
      lead={{
        id: lead.id,
        businessName: lead.businessName,
        status: lead.status,
        city: lead.city,
        category: lead.category,
        websiteUrl: lead.websiteUrl,
        qualificationScore: lead.qualificationScore,
        disqualifiedReason: lead.disqualifiedReason,
        failureReason: lead.failureReason,
      }}
      audit={audit}
      draft={draft}
    />
  );
}
