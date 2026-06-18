// Libs
import { inngest } from "@/lib/clients/inngest";
import { EVENTS, ingestRequestedData } from "@/constants/events";
import { findDuplicateLead, insertLead } from "@/lib/queries/leads";
import {
  finishIngestionRun,
  insertIngestionRun,
} from "@/lib/queries/ingestionRuns";
import { MAX_LEADS_PER_RUN } from "@/constants/leads";

export const ingestLeads = inngest.createFunction(
  {
    id: "ingest-leads",
    concurrency: { limit: 2 },
    triggers: [{ event: EVENTS.ingestRequested }],
  },
  async ({ event, step }) => {
    const data = ingestRequestedData.parse(event.data);
    const businesses = data.businesses.slice(0, MAX_LEADS_PER_RUN);

    const run = await step.run("record-run-start", () =>
      insertIngestionRun({
        source: data.source,
        query: data.query ?? null,
        params: { channel: data.channel, requested: data.businesses.length },
        status: "running",
      }),
    );

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
