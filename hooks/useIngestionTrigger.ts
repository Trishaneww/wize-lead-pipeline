"use client";

// Next.js
import { useState, useTransition } from "react";

// Libs
import { runPlacesIngestion } from "@/lib/actions/ingestionActions";
import { displayToast } from "@/lib/helpers/toast";

// Types
import type { Channel } from "@/constants/channels";

export function useIngestionTrigger() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const run = (input: { niche: string; city: string; channel: Channel }) => {
    startTransition(async () => {
      const result = await runPlacesIngestion(input);
      if (result.ok) {
        displayToast(
          "Ingestion started",
          "success",
          "New leads will appear here shortly.",
        );
        setOpen(false);
      } else {
        displayToast(result.error, "error");
      }
    });
  };

  return { open, setOpen, isPending, run };
}
