"use client";

// HTML Components
import { Button } from "@/components/ui/button";
import { Bell, Download, Plus } from "lucide-react";

// Components
import { RunIngestionSheet } from "@/components/leads/RunIngestionSheet";

// Libs
import { displayToast } from "@/lib/helpers/toast";

export const LeadsHeaderActions = () => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground"
        onClick={() =>
          displayToast(
            "Notifications",
            "info",
            "This feature is not yet available.",
          )
        }
        aria-label="Notifications"
      >
        <Bell className="size-4" />
      </Button>
      <RunIngestionSheet />
      <Button
        variant="secondary"
        size="sm"
        onClick={() =>
          displayToast("Import", "info", "This feature is not yet available.")
        }
      >
        <Download className="size-4" /> Import
      </Button>
      <Button
        size="sm"
        onClick={() =>
          displayToast("Add lead", "info", "This feature is not yet available.")
        }
      >
        <Plus className="size-4" /> Add Lead
      </Button>
    </div>
  );
};
