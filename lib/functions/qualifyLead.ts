// Libs
import { NonRetriableError } from "inngest";
import { inngest } from "@/lib/clients/inngest";
import { EVENTS, leadRefData } from "@/constants/events";
import { getLeadById, updateLead } from "@/lib/queries/leads";
import { auditRowToResult, latestAuditForLead } from "@/lib/queries/audits";
import { qualifyLead as runQualification } from "@/lib/anthropic";
import { markLeadFailed, toLeadInput } from "@/lib/functions/shared";

export const qualifyLead = inngest.createFunction(
  {
    id: "qualify-lead",
    concurrency: { limit: 5 },
    throttle: { limit: 20, period: "1m" },
    retries: 2,
    onFailure: markLeadFailed,
    triggers: [{ event: EVENTS.leadAudited, if: "event.data.batch != true" }],
  },
  async ({ event, step }) => {
    const { leadId } = leadRefData.parse(event.data);

    const lead = await step.run("load-lead", () => getLeadById(leadId));
    if (!lead) return { skipped: "lead-not-found" };

    const result = await step.run("qualify", async () => {
      const auditRow = await latestAuditForLead(leadId);
      if (!auditRow)
        throw new NonRetriableError(`No audit found for lead ${leadId}`);
      return runQualification({
        channel: lead.channel,
        lead: toLeadInput(lead),
        audit: auditRowToResult(auditRow),
      });
    });

    if (!result.qualified) {
      await step.run("mark-disqualified", () =>
        updateLead(leadId, {
          status: "disqualified",
          qualificationScore: result.score,
          disqualifiedReason: result.reasoning,
        }),
      );
      return { qualified: false, score: result.score };
    }

    await step.run("mark-qualified", () =>
      updateLead(leadId, {
        status: "qualified",
        qualificationScore: result.score,
      }),
    );
    await step.sendEvent("emit-lead-qualified", {
      name: EVENTS.leadQualified,
      data: {
        leadId,
        angle: result.suggested_angle,
        reasoning: result.reasoning,
      },
    });
    return { qualified: true, score: result.score };
  },
);
