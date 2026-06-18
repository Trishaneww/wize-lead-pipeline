"use server";

// Next.js
import { revalidatePath } from "next/cache";

// Libs
import { updateDraft } from "@/lib/queries/drafts";
import { updateLead } from "@/lib/queries/leads";

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

export async function rejectDraft(input: {
  draftId: string;
  leadId: string;
}): Promise<void> {
  await updateDraft(input.draftId, { status: "rejected" });
  await updateLead(input.leadId, { status: "archived" });
  revalidatePath(`/leads/${input.leadId}`);
  revalidatePath("/leads");
}
