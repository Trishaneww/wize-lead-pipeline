// Libs
import { inngest } from "@/lib/clients/inngest";
import { EVENTS, ingestRequestedData } from "@/constants/events";
import {
  countLeadsCreatedSince,
  findDuplicateLead,
  insertLead,
} from "@/lib/queries/leads";
import {
  finishIngestionRun,
  insertIngestionRun,
} from "@/lib/queries/ingestionRuns";
import { MAX_LEADS_PER_RUN } from "@/constants/leads";
import { MAX_LEADS_PER_DAY } from "@/constants/ingestion";

export const ingestLeads = inngest.createFunction(
  {
    id: "ingest-leads",
    concurrency: { limit: 2 },
    triggers: [{ event: EVENTS.ingestRequested }],
  },
  async ({ event, step }) => {
    const data = ingestRequestedData.parse(event.data);
    const run = await step.run("record-run-start", () =>
      insertIngestionRun({
        source: data.source,
        query: data.query ?? null,
        params: { channel: data.channel, requested: data.businesses.length },
        status: "running",
      }),
    );

    const usedToday = await step.run("count-daily", () => {
      const startOfDay = new Date();
      startOfDay.setUTCHours(0, 0, 0, 0);
      return countLeadsCreatedSince(startOfDay);
    });
    const cap = Math.min(MAX_LEADS_PER_RUN, MAX_LEADS_PER_DAY - usedToday);

    if (cap <= 0) {
      await step.run("record-run-skipped", () =>
        finishIngestionRun(run.id, {
          leadsFound: 0,
          status: "skipped",
          params: {
            channel: data.channel,
            requested: data.businesses.length,
            reason: "daily-cap-reached",
          },
          finishedAt: new Date(),
        }),
      );
      return {
        requested: data.businesses.length,
        created: 0,
        skipped: "daily-cap",
      };
    }

    const businesses = data.businesses.slice(0, cap);

    const createdIds = await step.run("insert-leads", async () => {
      const ids: string[] = [];
      for (const b of businesses) {
        const duplicate = await findDuplicateLead(
          data.channel,
          b.sourceRef,
          b.websiteUrl,
        );
        if (duplicate) continue;
        const lead = await insertLead({
          channel: data.channel,
          businessName: b.businessName,
          websiteUrl: b.websiteUrl ?? null,
          city: b.city ?? null,
          category: b.category ?? null,
          email: b.email ?? null,
          phone: b.phone ?? null,
          address: b.address ?? null,
          source: data.source,
          sourceRef: b.sourceRef ?? null,
          status: "new",
        });
        ids.push(lead.id);
      }
      return ids;
    });

    if (createdIds.length > 0) {
      await step.sendEvent(
        "emit-lead-created",
        createdIds.map((leadId) => ({
          name: EVENTS.leadCreated,
          data: { leadId },
        })),
      );
    }

    await step.run("record-run-finish", () =>
      finishIngestionRun(run.id, {
        leadsFound: createdIds.length,
        status: "completed",
        finishedAt: new Date(),
      }),
    );

    return { requested: data.businesses.length, created: createdIds.length };
  },
);
