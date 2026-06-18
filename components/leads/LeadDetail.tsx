"use client";

// HTML Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, Mail, Save, X } from "lucide-react";

// Components
import { StatusBadge } from "@/components/leads/StatusBadge";

// Hooks
import { useLeadDraft } from "@/hooks/useLeadDraft";

// Types
import type { DetailLead, DetailAudit, DetailDraft } from "@/types/leads";

interface LeadDetailProps {
  lead: DetailLead;
  audit: DetailAudit;
  draft: DetailDraft;
}

export const LeadDetail = ({ lead, audit, draft }: LeadDetailProps) => {
  return (
    <main className="space-y-6 p-6">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-foreground">
          {lead.businessName}
        </h1>
        <StatusBadge status={lead.status} />
        <div className="ml-auto text-sm text-muted-foreground">
          {[lead.category, lead.city].filter(Boolean).join(" · ")}
        </div>
      </header>

      {lead.failureReason && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <span className="font-medium">Failed:</span> {lead.failureReason}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <AuditCard audit={audit} disqualifiedReason={lead.disqualifiedReason} />
        <DraftCard lead={lead} draft={draft} />
      </div>
    </main>
  );
};

const AuditCard = ({
  audit,
  disqualifiedReason,
}: {
  audit: DetailAudit;
  disqualifiedReason: string | null;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Audit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {disqualifiedReason && (
          <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Disqualified:</span>{" "}
            {disqualifiedReason}
          </p>
        )}

        {!audit ? (
          <p className="text-sm text-muted-foreground">No audit yet.</p>
        ) : !audit.reachable ? (
          <p className="text-sm text-muted-foreground">
            Site could not be loaded.
          </p>
        ) : (
          <>
            {audit.screenshotDataUrl && (
              <div className="overflow-hidden rounded-md border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={audit.screenshotDataUrl}
                  alt="Homepage screenshot (mobile)"
                  className="w-full"
                />
              </div>
            )}
            {audit.findings.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {audit.findings.map((f) => (
                  <li key={f.key} className="flex gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      [{f.severity}]
                    </span>
                    <span className="text-foreground">{f.description}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No specific issues flagged.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

const DraftCard = ({
  lead,
  draft,
}: {
  lead: DetailLead;
  draft: DetailDraft;
}) => {
  if (!draft) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Outreach draft</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No draft generated yet.
          </p>
        </CardContent>
      </Card>
    );
  }
  return <DraftEditor lead={lead} draft={draft} />;
};

const DraftEditor = ({
  lead,
  draft,
}: {
  lead: DetailLead;
  draft: NonNullable<DetailDraft>;
}) => {
  const {
    body,
    setBody,
    hasUnsavedChanges,
    isPending,
    save,
    approve,
    reject,
    createDraft,
  } = useLeadDraft({
    draftId: draft.id,
    leadId: lead.id,
    initialBody: draft.body,
  });

  const hasEmail = !!lead.email;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Outreach draft</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Subject
          </Label>
          <p className="font-medium text-foreground">{draft.subject}</p>
        </div>

        <div className="space-y-1">
          <Label
            htmlFor="draft-body"
            className="text-xs uppercase tracking-wide text-muted-foreground"
          >
            Body{" "}
            {hasUnsavedChanges && (
              <span className="text-primary">· unsaved edits</span>
            )}
          </Label>
          <Textarea
            id="draft-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={16}
            className="resize-y font-sans leading-relaxed"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={save}
            disabled={!hasUnsavedChanges || isPending}
          >
            <Save className="size-4" /> Save edits
          </Button>
          <Button size="sm" onClick={approve} disabled={isPending}>
            <Check className="size-4" /> Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={reject}
            disabled={isPending}
          >
            <X className="size-4" /> Reject
          </Button>

          {hasEmail ? (
            <Button
              size="sm"
              variant="secondary"
              className="ml-auto"
              onClick={createDraft}
              disabled={isPending}
            >
              <Mail className="size-4" /> Create Gmail draft
            </Button>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="ml-auto">
                    <Button size="sm" variant="secondary" disabled>
                      <Mail className="size-4" /> Create Gmail draft
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  This lead has no email address
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
