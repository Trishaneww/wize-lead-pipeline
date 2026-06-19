// Libs
import { inngest } from "@/lib/clients/inngest";
import { EVENTS, leadRefData } from "@/constants/events";
import { getLeadById, updateLead } from "@/lib/queries/leads";
import { auditResultToRow, insertAudit } from "@/lib/queries/audits";
import { runSiteAudit } from "@/lib/siteAudit";
import { markLeadFailed } from "@/lib/functions/shared";

export const auditLead = inngest.createFunction(
  {
    id: "audit-lead",
    concurrency: { limit: 3 },
    retries: 2,
    onFailure: markLeadFailed,
    triggers: [{ event: EVENTS.leadCreated }],
  },
  async ({ event, step }) => {
    const { leadId } = leadRefData.parse(event.data);

    const lead = await step.run("load-lead", () => getLeadById(leadId));
    if (!lead) return { skipped: "lead-not-found" };

    if (!lead.websiteUrl) {
      await step.run("disqualify-no-site", () =>
        updateLead(leadId, {
          status: "disqualified",
          disqualifiedReason: "No website on file — nothing to audit.",
        }),
      );
      return { disqualified: "no-website" };
    }

    await step.run("set-auditing", () =>
      updateLead(leadId, { status: "auditing" }),
    );

    // Audit + persist in one step so the large base64 screenshot lands in the DB
    // and never bloats Inngest's memoized step state.
    const websiteUrl = lead.websiteUrl;
    const auditMeta = await step.run("run-and-persist-audit", async () => {
      const audit = await runSiteAudit(websiteUrl);
      const row = await insertAudit(auditResultToRow(leadId, audit));
      return {
        auditId: row.id,
        reachable: audit.reachable,
        contactEmail: audit.contactEmail,
      };
    });

    if (!auditMeta.reachable) {
      await step.run("disqualify-unreachable", () =>
        updateLead(leadId, {
          status: "disqualified",
          disqualifiedReason: "Website could not be loaded.",
        }),
      );
      return { disqualified: "unreachable" };
    }

    const scrapedEmail = auditMeta.contactEmail;
    if (scrapedEmail && !lead.email) {
      await step.run("enrich-email", () =>
        updateLead(leadId, { email: scrapedEmail }),
      );
    }

    await step.sendEvent("emit-lead-audited", {
      name: EVENTS.leadAudited,
      data: { leadId },
    });
    return { auditId: auditMeta.auditId };
  },
);
