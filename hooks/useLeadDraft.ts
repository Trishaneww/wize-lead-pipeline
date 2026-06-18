"use client";

// Next.js
import { useCallback, useState, useTransition } from "react";

// Libs
import {
  approveDraft,
  rejectDraft,
  saveDraftEdits,
} from "@/lib/actions/draftActions";

interface UseLeadDraftParams {
  draftId: string;
  leadId: string;
  initialBody: string;
}

export const useLeadDraft = ({
  draftId,
  leadId,
  initialBody,
}: UseLeadDraftParams) => {
  const [body, setBody] = useState(initialBody);
  const [savedBody, setSavedBody] = useState(initialBody);
  const [isPending, startTransition] = useTransition();
  const hasUnsavedChanges = body !== savedBody;

  const save = useCallback(() => {
    startTransition(async () => {
      await saveDraftEdits({ draftId, leadId, editedBody: body });
      setSavedBody(body);
    });
  }, [draftId, leadId, body, setSavedBody]);

  const approve = useCallback(() => {
    startTransition(async () => {
      if (hasUnsavedChanges) {
        await saveDraftEdits({ draftId, leadId, editedBody: body });
        setSavedBody(body);
      }
      await approveDraft({ draftId, leadId });
    });
  }, [hasUnsavedChanges, draftId, leadId, body, setSavedBody]);

  const reject = useCallback(() => {
    startTransition(() => rejectDraft({ draftId, leadId }));
  }, [draftId, leadId]);

  return { body, setBody, hasUnsavedChanges, isPending, save, approve, reject };
};
