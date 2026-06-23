// Libs
import { chromium, type Browser } from "playwright-core";
import sparticuz from "@sparticuz/chromium";
import { isProd } from "@/env";
import { logger } from "@/lib/logger";

export type Screenshot = { base64: string; mediaType: "image/png" };

const MOBILE_VIEWPORT = { width: 390, height: 844 };
const NAV_TIMEOUT_MS = 20_000;
const USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

async function launchBrowser(): Promise<Browser> {
  if (isProd) {
    return chromium.launch({
      args: sparticuz.args,
      executablePath: await sparticuz.executablePath(),
      headless: true,
    });
  }
  return chromium.launch({ headless: true, channel: "chrome" });
}

export async function captureHomepageScreenshot(
  url: string,
): Promise<Screenshot | null> {
  let browser: Browser | undefined;
  try {
    browser = await launchBrowser();
    const context = await browser.newContext({
      viewport: MOBILE_VIEWPORT,
      deviceScaleFactor: 2,
      userAgent: USER_AGENT,
    });
    const page = await context.newPage();
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: NAV_TIMEOUT_MS,
    });
    await page.waitForTimeout(2500);
    const buffer = await page.screenshot({ type: "png" });
    return { base64: buffer.toString("base64"), mediaType: "image/png" };
  } catch (error) {
    logger.warn(
      { url, err: error },
      "Screenshot capture failed; continuing without it",
    );
    return null;
  } finally {
    await browser?.close().catch(() => {});
  }
}
