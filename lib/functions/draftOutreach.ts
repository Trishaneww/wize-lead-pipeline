// Libs
import { NonRetriableError } from "inngest";
import { inngest } from "@/lib/clients/inngest";
import { DRAFT_MODEL, generateOutreachDraft } from "@/lib/anthropic";
import { EVENTS, leadQualifiedData } from "@/constants/events";
import { getLeadById, updateLead } from "@/lib/queries/leads";
import { auditRowToResult, latestAuditForLead } from "@/lib/queries/audits";
import { insertDraft } from "@/lib/queries/drafts";
import { markLeadFailed, toLeadInput } from "@/lib/functions/shared";

export const draftOutreach = inngest.createFunction(
  {
    id: "draft-outreach",
    concurrency: { limit: 5 },
    throttle: { limit: 20, period: "1m" },
    retries: 2,
    onFailure: markLeadFailed,
    triggers: [{ event: EVENTS.leadQualified, if: "event.data.batch != true" }],
  },
  async ({ event, step }) => {
    const { leadId, angle, reasoning } = leadQualifiedData.parse(event.data);

    const lead = await step.run("load-lead", () => getLeadById(leadId));
    if (!lead) return { skipped: "lead-not-found" };

    await step.run("set-drafting", () =>
      updateLead(leadId, { status: "drafting" }),
    );

    const draft = await step.run("draft", async () => {
      const auditRow = await latestAuditForLead(leadId);
      if (!auditRow)
        throw new NonRetriableError(`No audit found for lead ${leadId}`);
      return generateOutreachDraft({
        channel: lead.channel,
        lead: toLeadInput(lead),
        audit: auditRowToResult(auditRow),
        angle,
        qualificationReasoning: reasoning,
      });
    });

    await step.run("persist-draft", async () => {
      await insertDraft({
        leadId,
        subject: draft.subject,
        body: draft.body,
        angle,
        model: DRAFT_MODEL,
        status: "generated",
      });
      await updateLead(leadId, { status: "drafted" });
    });

    return { drafted: true };
  },
);
