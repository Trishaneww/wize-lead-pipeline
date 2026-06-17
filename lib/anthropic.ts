// Libs
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { OPT_OUT_LINE } from "@/constants/agency";
import { AnthropicParseError } from "@/lib/errors";
import { buildDraftPrompt, buildQualifyPrompt } from "@/lib/prompts";
import { anthropic as client } from "@/lib/clients/anthropic";

// Types
import type { SiteAuditResult } from "@/types/audits";
import type { DraftInput, QualifyInput } from "@/types/pipeline";

export const QUALIFY_MODEL = "claude-haiku-4-5-20251001";
export const DRAFT_MODEL = "claude-sonnet-4-6";

export const QualificationResultSchema = z.object({
  qualified: z.boolean(),
  score: z.number().int().min(0).max(100),
  reasoning: z.string().min(1),
  suggested_angle: z.string().min(1),
});
export type QualificationResult = z.infer<typeof QualificationResultSchema>;

export const OutreachDraftSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
});
export type OutreachDraftResult = z.infer<typeof OutreachDraftSchema>;

export async function qualifyLead(
  input: QualifyInput,
): Promise<QualificationResult> {
  const { system, user } = buildQualifyPrompt(input);

  const response = await client.messages.parse({
    model: QUALIFY_MODEL,
    max_tokens: 1024,
    system,
    messages: [
      { role: "user", content: buildMessageContent(user, input.audit) },
    ],
    output_config: { format: zodOutputFormat(QualificationResultSchema) },
  });

  if (!response.parsed_output) {
    throw new AnthropicParseError(
      `Qualification did not return valid structured output (stop_reason: ${response.stop_reason})`,
    );
  }
  
  return response.parsed_output;
}

export async function generateOutreachDraft(
  input: DraftInput,
): Promise<OutreachDraftResult> {
  const { system, user } = buildDraftPrompt(input);

  const response = await client.messages.parse({
    model: DRAFT_MODEL,
    max_tokens: 1500,
    system,
    messages: [
      { role: "user", content: buildMessageContent(user, input.audit) },
    ],
    output_config: { format: zodOutputFormat(OutreachDraftSchema) },
  });

  if (!response.parsed_output) {
    throw new AnthropicParseError(
      `Draft generation did not return valid structured output (stop_reason: ${response.stop_reason})`,
    );
  }

  return {
    subject: response.parsed_output.subject,
    body: ensureOptOut(response.parsed_output.body),
  };
}

function buildMessageContent(
  text: string,
  audit: SiteAuditResult,
): Anthropic.ContentBlockParam[] | string {
  if (!audit.screenshotBase64) return text;
  return [
    {
      type: "image",
      source: {
        type: "base64",
        media_type: "image/png",
        data: audit.screenshotBase64,
      },
    },
    { type: "text", text },
  ];
}

function ensureOptOut(body: string): string {
  if (
    /unsubscribe|won['’]?t (follow|contact|reach)|not for you|opt out/i.test(
      body,
    )
  ) {
    return body;
  }
  return `${body.trimEnd()}\n\n${OPT_OUT_LINE}`;
}
