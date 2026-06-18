"use client";

// Next.js
import Link from "next/link";

// HTML Components
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowUpRight, ExternalLink } from "lucide-react";

// Components
import { StatusBadge } from "@/components/leads/StatusBadge";

// Libs
import { normalizeUrl } from "@/lib/helpers/url";
import type { LeadListItem } from "@/types/leads";

interface LeadSheetProps {
  lead: LeadListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LeadSheet = ({ lead, open, onOpenChange }: LeadSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        {lead && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <SheetTitle className="text-lg">{lead.businessName}</SheetTitle>
                <StatusBadge status={lead.status} />
              </div>
              <SheetDescription>
                {[lead.category, lead.city].filter(Boolean).join(" · ") || "—"}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4 px-4 text-sm">
              <Field
                label="Qualification score"
                value={lead.qualificationScore?.toString() ?? "—"}
              />
              <Field
                label="Website"
                value={
                  lead.websiteUrl ? (
                    <a
                      href={normalizeUrl(lead.websiteUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      {lead.websiteUrl} <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
              {lead.disqualifiedReason && (
                <Field label="Disqualified" value={lead.disqualifiedReason} />
              )}
              {lead.failureReason && (
                <Field
                  label="Failure"
                  value={
                    <span className="text-destructive">
                      {lead.failureReason}
                    </span>
                  }
                />
              )}

              <Separator />

              <Button asChild className="w-full">
                <Link href={`/leads/${lead.id}`}>
                  Open full lead <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="text-foreground">{value}</div>
    </div>
  );
};
