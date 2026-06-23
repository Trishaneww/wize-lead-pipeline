// Libs
import { inngest } from "@/lib/clients/inngest";
import { EVENTS, leadRefData } from "@/constants/events";
import {
  buildQualifyBatchRequest,
  parseQualifyBatchResult,
} from "@/lib/anthropic";
import {
  collectBatchResults,
  getBatchStatus,
  submitBatch,
} from "@/lib/anthropicBatch";
import { auditRowToResult, latestAuditForLead } from "@/lib/queries/audits";
import { getLeadById, updateLead } from "@/lib/queries/leads";
import { markLeadsFailed, toLeadInput } from "@/lib/functions/shared";
import { logger } from "@/lib/logger";

const MAX_POLLS = 90;

export const batchQualifyLeads = inngest.createFunction(
  {
    id: "batch-qualify-leads",
    batchEvents: { maxSize: 50, timeout: "30s" },
    concurrency: { limit: 2 },
    retries: 2,
    onFailure: ({ error }) =>
      logger.error({ err: error }, "batch-qualify-leads run failed"),
    triggers: [{ event: EVENTS.leadAudited, if: "event.data.batch == true" }],
  },
  async ({ events, step }) => {
    const submitted = await step.run("build-and-submit", async () => {
      const requests = [];
      const leadIds: string[] = [];
      const skipped: string[] = [];

      for (const e of events) {
        const { leadId } = leadRefData.parse(e.data);
        const lead = await getLeadById(leadId);
        const auditRow = lead ? await latestAuditForLead(leadId) : undefined;

        if (!lead || !auditRow) {
          skipped.push(leadId);
          continue;
        }

        requests.push(
          buildQualifyBatchRequest(leadId, {
            channel: lead.channel,
            lead: toLeadInput(lead),
            audit: auditRowToResult(auditRow),
          }),
        );
        leadIds.push(leadId);
      }

      if (requests.length === 0) {
        return { batchId: null as string | null, leadIds, skipped };
      }

      return { batchId: await submitBatch(requests), leadIds, skipped };
    });

    if (!submitted.batchId) {
      return { qualified: 0, skipped: submitted.skipped.length };
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
          "Qualification batch timed out (still processing)",
        ),
      );
      logger.error({ batchId }, "Qualification batch exceeded poll window");

      return { timedOut: true, batchId };
    }

    const results = await step.run("collect", () =>
      collectBatchResults(batchId),
    );

    const qualified = await step.run("distribute", async () => {
      const out: { leadId: string; angle: string; reasoning: string }[] = [];
      for (const { customId, result } of results) {
        try {
          if (result.type === "succeeded") {
            const q = parseQualifyBatchResult(result.message);
            if (q.qualified) {
              await updateLead(customId, {
                status: "qualified",
                qualificationScore: q.score,
              });
              out.push({
                leadId: customId,
                angle: q.suggested_angle,
                reasoning: q.reasoning,
              });
            } else {
              await updateLead(customId, {
                status: "disqualified",
                qualificationScore: q.score,
                disqualifiedReason: q.reasoning,
              });
            }
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
              : "Qualification parse failed"
            ).slice(0, 500),
          });
        }
      }

      return out;
    });

    if (qualified.length > 0) {
      await step.sendEvent(
        "emit-qualified",
        qualified.map((q) => ({
          name: EVENTS.leadQualified,
          data: { ...q, batch: true },
        })),
      );
    }

    return { qualified: qualified.length, skipped: submitted.skipped.length };
  },
);
