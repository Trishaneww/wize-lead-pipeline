// Libs
import { env } from "@/env";
import { PageSpeedError } from "@/lib/errors";

export type PageSpeedResult = {
  performanceScore: number | null;
  lcpMs: number | null;
  cls: number | null;
  raw: unknown;
};

const ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const MAX_ATTEMPTS = 2;

type PageSpeedApiResponse = {
  lighthouseResult?: {
    categories?: { performance?: { score?: number | null } };
    audits?: Record<string, { numericValue?: number }>;
  };
};

export async function runPageSpeed(url: string): Promise<PageSpeedResult> {
  const params = new URLSearchParams({
    url,
    key: env.PAGESPEED_API_KEY,
    strategy: "mobile",
    category: "performance",
  });
  const requestUrl = `${ENDPOINT}?${params.toString()}`;

  let lastError: PageSpeedError | null = null;
  let apiResponse: PageSpeedApiResponse | null = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let response: Response;
    try {
      response = await fetch(requestUrl);
    } catch (cause) {
      throw new PageSpeedError(`PageSpeed request failed for ${url}`, {
        cause,
      });
    }

    if (response.ok) {
      apiResponse = (await response.json()) as PageSpeedApiResponse;
      break;
    }

    const detail = await response.text().catch(() => "");
    lastError = new PageSpeedError(
      `PageSpeed returned ${response.status} for ${url}: ${detail.slice(0, 300)}`,
    );

    if (response.status < 500) break;
  }

  if (apiResponse === null) {
    throw lastError ?? new PageSpeedError(`PageSpeed failed for ${url}`);
  }

  const lighthouse = apiResponse.lighthouseResult;
  const audits = lighthouse?.audits ?? {};

  const scoreRaw = lighthouse?.categories?.performance?.score;
  const performanceScore =
    typeof scoreRaw === "number" ? Math.round(scoreRaw * 100) : null;

  const lcpRaw = audits["largest-contentful-paint"]?.numericValue;
  const lcpMs = typeof lcpRaw === "number" ? Math.round(lcpRaw) : null;

  const clsRaw = audits["cumulative-layout-shift"]?.numericValue;
  const cls = typeof clsRaw === "number" ? Number(clsRaw.toFixed(3)) : null;

  return { performanceScore, lcpMs, cls, raw: apiResponse };
}
