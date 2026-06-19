// Libs
import { inngest } from "@/lib/clients/inngest";
import { EVENTS, leadQualifiedData } from "@/constants/events";
import {
  DRAFT_MODEL,
  buildDraftBatchRequest,
  parseDraftBatchResult,
} from "@/lib/anthropic";
import {
  collectBatchResults,
  getBatchStatus,
  submitBatch,
} from "@/lib/anthropicBatch";
import { auditRowToResult, latestAuditForLead } from "@/lib/queries/audits";
import { insertDraft } from "@/lib/queries/drafts";
import { getLeadById, updateLead } from "@/lib/queries/leads";
import { markLeadsFailed, toLeadInput } from "@/lib/functions/shared";
import { logger } from "@/lib/logger";

const MAX_POLLS = 90;

export const batchDraftOutreach = inngest.createFunction(
  {
    id: "batch-draft-outreach",
    batchEvents: { maxSize: 50, timeout: "30s" },
    concurrency: { limit: 2 },
    retries: 2,
    onFailure: ({ error }) =>
      logger.error({ err: error }, "batch-draft-outreach run failed"),
    triggers: [{ event: EVENTS.leadQualified, if: "event.data.batch == true" }],
  },
  async ({ events, step }) => {
    const submitted = await step.run("build-and-submit", async () => {
      const requests = [];
      const leadIds: string[] = [];
      const leadAngles: Record<string, string> = {};
      const skipped: string[] = [];

      for (const e of events) {
        const { leadId, angle, reasoning } = leadQualifiedData.parse(e.data);
        const lead = await getLeadById(leadId);
        const auditRow = lead ? await latestAuditForLead(leadId) : undefined;
        if (!lead || !auditRow) {
          skipped.push(leadId);
          continue;
        }
        requests.push(
          buildDraftBatchRequest(leadId, {
            channel: lead.channel,
            lead: toLeadInput(lead),
            audit: auditRowToResult(auditRow),
            angle,
            qualificationReasoning: reasoning,
          }),
        );
        leadIds.push(leadId);
        leadAngles[leadId] = angle;
      }

      if (requests.length === 0) {
        return { batchId: null as string | null, leadIds, leadAngles, skipped };
      }

      return {
        batchId: await submitBatch(requests),
        leadIds,
        leadAngles,
        skipped,
      };
    });

    if (!submitted.batchId) {
      return { drafted: 0, skipped: submitted.skipped.length };
    }
    const batchId = submitted.batchId;

    let ended = false;
    for (let i = 0; i < MAX_POLLS; i++) {
      await step.sleep(`wait-${i}`, "60s");
      const status = await step.run(`poll-${i}`, () => getBatchStatus(batchId));
      if (status.status === "ended") {
        ended = true;
        break;
      }
    }

    if (!ended) {
      await step.run("mark-timed-out", () =>
        markLeadsFailed(
          submitted.leadIds,
          "Draft batch timed out (still processing)",
        ),
      );
      logger.error({ batchId }, "Draft batch exceeded poll window");
      return { timedOut: true, batchId };
    }

    const results = await step.run("collect", () =>
      collectBatchResults(batchId),
    );

    const drafted = await step.run("distribute", async () => {
      let count = 0;
      for (const { customId, result } of results) {
        try {
          if (result.type === "succeeded") {
            const draft = parseDraftBatchResult(result.message);
            await insertDraft({
              leadId: customId,
              subject: draft.subject,
              body: draft.body,
              angle: submitted.leadAngles[customId],
              model: DRAFT_MODEL,
              status: "generated",
            });
            await updateLead(customId, { status: "drafted" });
            count += 1;
          } else if (result.type === "errored") {
            await updateLead(customId, {
              status: "failed",
              failureReason: `Batch request errored: ${JSON.stringify(
                result.error,
              ).slice(0, 400)}`,
            });
          } else {
            await updateLead(customId, {
              status: "failed",
              failureReason: `Batch request ${result.type}`,
            });
          }
        } catch (error) {
          await updateLead(customId, {
            status: "failed",
            failureReason: (error instanceof Error
              ? error.message
              : "Draft parse failed"
            ).slice(0, 500),
          });
        }
      }
      
      return count;
    });

    return { drafted, skipped: submitted.skipped.length };
  },
);
