"use server";

// Next.js
import { revalidatePath } from "next/cache";

// Libs
import { GmailAuthError, GmailError } from "@/lib/errors";
import { createGmailDraft } from "@/lib/gmail";
import { requireOperator } from "@/lib/helpers/auth";
import { latestDraftForLead, updateDraft } from "@/lib/queries/drafts";
import {
  gmailDraftForOutreachDraft,
  insertGmailDraft,
} from "@/lib/queries/gmailDrafts";
import { getLeadById, updateLead } from "@/lib/queries/leads";

type CreateGmailDraftResult =
  | { ok: true; gmailDraftId: string }
  | { ok: false; error: string };

export async function saveDraftEdits(input: {
  draftId: string;
  leadId: string;
  editedBody: string;
}): Promise<void> {
  await updateDraft(input.draftId, {
    editedBody: input.editedBody,
    status: "edited",
  });
  revalidatePath(`/leads/${input.leadId}`);
}

export async function approveDraft(input: {
  draftId: string;
  leadId: string;
}): Promise<void> {
  await updateDraft(input.draftId, { status: "approved" });
  await updateLead(input.leadId, { status: "approved" });
  revalidatePath(`/leads/${input.leadId}`);
  revalidatePath("/leads");
}

export async function createGmailDraftAction(input: {
  draftId: string;
  leadId: string;
}): Promise<CreateGmailDraftResult> {
  try {
    const { email } = await requireOperator();

    const lead = await getLeadById(input.leadId);
    if (!lead) return { ok: false, error: "Lead not found." };
    if (!lead.email) {
      await updateLead(input.leadId, {
        failureReason: "No email address on lead — cannot create Gmail draft.",
      });
      revalidatePath(`/leads/${input.leadId}`);
      return { ok: false, error: "This lead has no email address." };
    }

    const existing = await gmailDraftForOutreachDraft(input.draftId);
    if (existing?.gmailDraftId) {
      return { ok: true, gmailDraftId: existing.gmailDraftId };
    }

    const draft = await latestDraftForLead(input.leadId);
    const { gmailDraftId } = await createGmailDraft({
      to: lead.email,
      subject: draft?.subject ?? "",
      body: draft?.editedBody ?? draft?.body ?? "",
      operatorEmail: email,
    });

    await insertGmailDraft({
      leadId: input.leadId,
      outreachDraftId: input.draftId,
      gmailDraftId,
      createdBy: email,
    });
    await updateDraft(input.draftId, { status: "approved" });
    await updateLead(input.leadId, { status: "draft_created" });
    revalidatePath(`/leads/${input.leadId}`);
    revalidatePath("/leads");
    
    return { ok: true, gmailDraftId };
  } catch (error) {
    if (error instanceof GmailAuthError) {
      return { ok: false, error: "Gmail not connected. Reconnect in Settings." };
    }
    if (error instanceof GmailError) {
      return { ok: false, error: "Could not create the Gmail draft. Try again." };
    }
    throw error;
  }
}

export async function rejectDraft(input: {
  draftId: string;
  leadId: string;
}): Promise<void> {
  await updateDraft(input.draftId, { status: "rejected" });
  await updateLead(input.leadId, { status: "archived" });
  revalidatePath(`/leads/${input.leadId}`);
  revalidatePath("/leads");
}
