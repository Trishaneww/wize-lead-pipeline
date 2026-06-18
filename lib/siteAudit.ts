// Libs
import * as cheerio from "cheerio";
import { logger } from "@/lib/logger";
import { runPageSpeed } from "@/lib/pagespeed";
import { captureHomepageScreenshot } from "@/lib/screenshot";
import { normalizeUrl } from "@/lib/helpers/validate";
import {
  extractSignals,
  extractVisibleText,
  deriveFindings,
  buildSiteSummary,
  unreachableResult,
} from "@/lib/helpers/siteAudit";

// Types
import type { SiteAuditResult } from "@/types/audits";

const FETCH_TIMEOUT_MS = 15_000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; WizeStudiosAuditBot/1.0; +https://wizestudios.ca)";

export async function runSiteAudit(rawUrl: string): Promise<SiteAuditResult> {
  const url = normalizeUrl(rawUrl);
  const hasHttps = url.startsWith("https://");

  const html = await fetchHtml(url);
  if (html === null) {
    return unreachableResult(hasHttps);
  }

  const $ = cheerio.load(html);
  const title = $("head > title").first().text().trim();
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() ?? "";
  const hasViewportMeta = $('meta[name="viewport"]').length > 0;
  const signals = extractSignals($);
  const visibleText = extractVisibleText($);

  const [screenshot, pageSpeed] = await Promise.all([
    captureHomepageScreenshot(url),
    runPageSpeed(url).catch((error) => {
      logger.warn(
        { url, err: error },
        "PageSpeed lookup failed; continuing without performance data",
      );
      return null;
    }),
  ]);

  const performanceScore = pageSpeed?.performanceScore ?? null;
  const lcpMs = pageSpeed?.lcpMs ?? null;
  const cls = pageSpeed?.cls ?? null;

  const findings = deriveFindings({
    hasHttps,
    hasViewportMeta,
    performanceScore,
    lcpMs,
    signals,
    hasTitle: Boolean(title),
  });

  return {
    reachable: true,
    hasHttps,
    hasViewportMeta,
    mobileFriendly: hasViewportMeta,
    performanceScore,
    lcpMs,
    cls,
    findings,
    signals,
    siteSummary: buildSiteSummary(title, metaDescription),
    visibleText,
    screenshotBase64: screenshot?.base64 ?? null,
    rawPagespeed: pageSpeed?.raw ?? null,
  };
}

async function fetchHtml(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": USER_AGENT, accept: "text/html" },
      redirect: "follow",
    });
    if (!response.ok) {
      logger.warn(
        { url, status: response.status },
        "Site fetch returned non-OK status",
      );
      return null;
    }
    return await response.text();
  } catch (error) {
    logger.warn({ url, err: error }, "Site fetch failed");
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
