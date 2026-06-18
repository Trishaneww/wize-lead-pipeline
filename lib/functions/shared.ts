// Libs
import { updateLead } from "@/lib/queries/leads";

// Types
import type { LeadRow } from "@/lib/queries/leads";
import type { LeadInput } from "@/types/pipeline";

export function toLeadInput(
  lead: Pick<LeadRow, "businessName" | "websiteUrl" | "city" | "category">,
): LeadInput {
  return {
    businessName: lead.businessName,
    websiteUrl: lead.websiteUrl,
    city: lead.city,
    category: lead.category,
  };
}

interface FailureContext {
  event: { data?: { leadId?: string; event?: { data?: { leadId?: string } } } };
  error: Error;
}

export async function markLeadFailed({
  event,
  error,
}: FailureContext): Promise<void> {
  const leadId = event.data?.leadId ?? event.data?.event?.data?.leadId;
  if (typeof leadId === "string") {
    await updateLead(leadId, {
      status: "failed",
      failureReason: (error.message ?? "Unknown failure").slice(0, 500),
    });
  }
}
