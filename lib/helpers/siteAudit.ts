// Libs
import * as cheerio from "cheerio";

// Types
import type { AuditFinding, SiteAuditResult, SiteSignals } from "@/types/audits";

const CTA_PATTERN =
  /\b(book|call|quote|contact|get started|schedule|order|buy|appointment|request|estimate|free)\b/i;
const SOCIAL_PATTERN =
  /(facebook|instagram|twitter|x\.com|linkedin|tiktok|yelp|youtube)\.com/i;
const BOOKING_PATTERN = /calendly|acuity|squareup|booksy|setmore|book\b|schedule\b/i;

const EGREGIOUS_LCP_MS = 10_000;
const EGREGIOUS_PERF_SCORE = 30;

export function normalizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function extractSignals($: cheerio.CheerioAPI): SiteSignals {
  const bodyText = $("body").text().toLowerCase();

  const ctaLabels = new Set<string>();
  $("a, button").each((_, el) => {
    const label = $(el).text().replace(/\s+/g, " ").trim();
    if (label && label.length <= 30 && CTA_PATTERN.test(label)) {
      ctaLabels.add(label);
    }
  });

  const socialLinks = new Set<string>();
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const match = SOCIAL_PATTERN.exec(href);
    if (match) socialLinks.add(match[1].toLowerCase());
  });

  const bookingHref = $("a[href]")
    .toArray()
    .some((el) => BOOKING_PATTERN.test($(el).attr("href") ?? ""));

  return {
    hasTapToCall: $('a[href^="tel:"]').length > 0,
    hasContactForm: $("form").length > 0 || $('input[type="email"], input[type="tel"]').length > 0,
    hasOnlineBooking:
      bookingHref || /book (now|online)|schedule (online|now)|book an appointment/.test(bodyText),
    ctaLabels: [...ctaLabels].slice(0, 8),
    mentionsReviews:
      /review|testimonial|rating|\bstars?\b|what our (customers|clients) say/.test(bodyText),
    socialLinks: [...socialLinks],
    copyrightYear: extractCopyrightYear(bodyText),
  };
}

export function extractVisibleText($: cheerio.CheerioAPI): string {
  $("script, style, noscript, svg").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim();
  return text.slice(0, 2000);
}

export type FindingInputs = {
  hasHttps: boolean;
  hasViewportMeta: boolean;
  performanceScore: number | null;
  lcpMs: number | null;
  signals: SiteSignals;
  hasTitle: boolean;
};

export function deriveFindings(i: FindingInputs): AuditFinding[] {
  const findings: AuditFinding[] = [];

  if (!i.hasHttps) {
    findings.push({ key: "no_https", severity: "high", description: "Site is not served over HTTPS — browsers show 'Not secure', which makes first-time visitors hesitate." });
  }
  if (!i.hasViewportMeta) {
    findings.push({ key: "no_viewport", severity: "high", description: "No mobile viewport tag — the site likely renders poorly on phones, where most visitors arrive." });
  }
  if (!i.signals.hasTapToCall) {
    findings.push({ key: "no_tap_to_call", severity: "medium", description: "No tap-to-call link — mobile visitors can't call in one tap." });
  }
  if (!i.signals.hasContactForm && !i.signals.hasTapToCall) {
    findings.push({ key: "no_contact_path", severity: "high", description: "No obvious way to get in touch (no contact form and no tap-to-call)." });
  }
  if (!i.signals.mentionsReviews) {
    findings.push({ key: "no_reviews_surfaced", severity: "low", description: "No reviews or testimonials surfaced — trust isn't visible to a first-time visitor." });
  }
  if (i.signals.copyrightYear !== null && i.signals.copyrightYear < new Date().getFullYear() - 2) {
    findings.push({ key: "stale_copyright", severity: "low", description: `Footer copyright says ${i.signals.copyrightYear} — the site looks untended.` });
  }
  if (!i.hasTitle) {
    findings.push({ key: "no_title", severity: "low", description: "Homepage has no <title> — hurts search visibility and browser tabs." });
  }

  const egregiouslySlow =
    (i.performanceScore !== null && i.performanceScore < EGREGIOUS_PERF_SCORE) ||
    (i.lcpMs !== null && i.lcpMs > EGREGIOUS_LCP_MS);
  if (egregiouslySlow && i.lcpMs !== null) {
    findings.push({ key: "egregiously_slow", severity: "high", description: `The site is extremely slow on mobile — main content takes ${(i.lcpMs / 1000).toFixed(1)}s to appear, long enough that many visitors leave first.` });
  }

  return findings;
}

export function buildSiteSummary(title: string, metaDescription: string): string {
  const parts = [title || "(no title)"];
  if (metaDescription) parts.push(metaDescription);
  return parts.join(" — ");
}

export function unreachableResult(hasHttps: boolean): SiteAuditResult {
  return {
    reachable: false,
    hasHttps,
    hasViewportMeta: false,
    mobileFriendly: null,
    performanceScore: null,
    lcpMs: null,
    cls: null,
    findings: [
      { key: "unreachable", severity: "critical", description: "The website could not be loaded." },
    ],
    signals: {
      hasTapToCall: false,
      hasContactForm: false,
      hasOnlineBooking: false,
      ctaLabels: [],
      mentionsReviews: false,
      socialLinks: [],
      copyrightYear: null,
    },
    siteSummary: "",
    visibleText: "",
    screenshotBase64: null,
    rawPagespeed: null,
  };
}

function extractCopyrightYear(bodyText: string): number | null {
  const match = bodyText.match(/(?:©|copyright|&copy;)\s*(?:\d{4}\s*[-–]\s*)?(\d{4})/);
  if (!match) return null;
  const year = Number(match[1]);
  return year >= 1995 && year <= new Date().getFullYear() + 1 ? year : null;
}
