// Libs
import { AGENCY, SIGNATURE } from "@/constants/agency";
import { CHANNELS } from "@/constants/channels";

// Types
import type { SiteAuditResult } from "@/types/audits";
import type { DraftInput, QualifyInput } from "@/types/pipeline";

export type AssembledPrompt = { system: string; user: string };

export function buildQualifyPrompt({ channel, lead, audit }: QualifyInput): AssembledPrompt {
  const cfg = CHANNELS[channel];

  const system = [
    `You are a lead-qualification analyst for ${AGENCY.name}, a web design agency.`,
    ``,
    cfg.qualifyFocus,
    ``,
    `You are given the business details, a screenshot of their homepage on mobile (if available), and signals extracted from the site. Judge ONLY from this evidence — never invent problems.`,
    ``,
    `Return:`,
    `- "qualified": is this worth reaching out to for ${cfg.label}?`,
    `- "score" (0-100): how strong the opportunity is.`,
    `- "reasoning": one or two sentences framed for a salesperson — the opportunity in business terms.`,
    `- "suggested_angle": the SINGLE most compelling missed opportunity to lead outreach with, stated concretely in terms of customer impact (e.g. "the homepage buries the phone number and reviews, so first-time visitors hesitate and click off"). Not a technical metric.`,
  ].join("\n");

  const user = renderLeadAndAudit(lead, audit);

  return { system, user };
}

export function buildDraftPrompt({
  channel,
  lead,
  audit,
  angle,
  qualificationReasoning,
}: DraftInput): AssembledPrompt {
  const cfg = CHANNELS[channel];

  const system = [
    `You write outreach emails as ${AGENCY.senderFullName} of ${AGENCY.name}.`,
    `Agency positioning: ${AGENCY.positioning}`,
    `What we're offering on this email: ${cfg.offer}.`,
    ``,
    cfg.draftFocus,
    ``,
    `Voice: technical and professional, but warm and personable — a capable person who noticed something and genuinely wants to help.`,
    ``,
    `Hard rules:`,
    `- Only state facts you can verify from the provided site content, signals, or screenshot. NEVER invent credentials, years in business, awards, certifications, or review counts. If you can't verify a specific fact, praise something you can actually see.`,
    `- Lead with the missed opportunity (the angle below), not technical metrics.`,
    `- Include the friendly opt-out and sign off exactly as:\n${SIGNATURE}`,
    `- "subject": friendly and benefit-oriented, specific to the business (e.g. "A few ideas to help ${lead.businessName} win more calls"). No spam phrasing, no ALL CAPS.`,
  ].join("\n");

  const user = [
    renderLeadAndAudit(lead, audit),
    ``,
    `Lead the email with this missed opportunity (the angle): ${angle}`,
    `Why this business is a good fit: ${qualificationReasoning}`,
  ].join("\n");

  return { system, user };
}

function renderLeadAndAudit(
  lead: DraftInput["lead"],
  audit: SiteAuditResult,
): string {
  return [
    `Business: ${lead.businessName}`,
    lead.category ? `Category: ${lead.category}` : null,
    lead.city ? `City: ${lead.city}` : null,
    lead.websiteUrl ? `Website: ${lead.websiteUrl}` : `Website: (none found)`,
    ``,
    summarizeAudit(audit),
  ]
    .filter((line) => line !== null)
    .join("\n");
}

function summarizeAudit(audit: SiteAuditResult): string {
  if (!audit.reachable) {
    return "Audit: the website could not be loaded (unreachable or no site).";
  }

  const { signals } = audit;
  const lines = [
    `Audit signals:`,
    `- HTTPS: ${audit.hasHttps ? "yes" : "no"}`,
    `- Mobile viewport tag: ${audit.hasViewportMeta ? "present" : "missing"}`,
    `- Tap-to-call link: ${signals.hasTapToCall ? "yes" : "no"}`,
    `- Contact form: ${signals.hasContactForm ? "yes" : "no"}`,
    `- Online booking: ${signals.hasOnlineBooking ? "yes" : "no"}`,
    `- Reviews/testimonials surfaced: ${signals.mentionsReviews ? "yes" : "no"}`,
    `- Calls-to-action found: ${signals.ctaLabels.length ? signals.ctaLabels.join(", ") : "none obvious"}`,
    `- Social links: ${signals.socialLinks.length ? signals.socialLinks.join(", ") : "none"}`,
    signals.copyrightYear ? `- Footer copyright year: ${signals.copyrightYear}` : null,
    audit.performanceScore !== null ? `- PageSpeed (mobile): ${audit.performanceScore}/100` : null,
  ].filter((line) => line !== null);

  const findings = audit.findings.length
    ? audit.findings.map((f) => `- [${f.severity}] ${f.description}`)
    : ["- (no specific issues flagged)"];

  return [
    ...lines,
    ``,
    `Site summary: ${audit.siteSummary || "(none)"}`,
    ``,
    `Homepage copy (excerpt, for grounding factual claims — do not quote verbatim):`,
    audit.visibleText ? `"${audit.visibleText}"` : "(none captured)",
    ``,
    `Findings:`,
    ...findings,
  ].join("\n");
}
