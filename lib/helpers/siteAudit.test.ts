// Libs
import { describe, expect, it } from "vitest";
import * as cheerio from "cheerio";
import {
  extractContactEmail,
  findContactUrl,
} from "@/lib/helpers/siteAudit";

const wrap = (body: string) => cheerio.load(`<html><body>${body}</body></html>`);

describe("extractContactEmail", () => {
  it("prefers a mailto: link", () => {
    const $ = wrap(
      `<a href="mailto:hello@brightsmiles.ca?subject=Hi">Email us</a>`,
    );
    expect(extractContactEmail($)).toBe("hello@brightsmiles.ca");
  });

  it("falls back to a plain-text address in the body", () => {
    const $ = wrap(`<footer>Reach us at info@oakvilledental.com today.</footer>`);
    expect(extractContactEmail($)).toBe("info@oakvilledental.com");
  });

  it("ignores build/CDN noise and asset filenames", () => {
    const $ = wrap(
      `<span>abc123@sentry.wixpress.com</span><img alt="logo@2x.png">` +
        `<a href="mailto:contact@realbusiness.ca">Contact</a>`,
    );
    expect(extractContactEmail($)).toBe("contact@realbusiness.ca");
  });

  it("returns null when there is no email", () => {
    const $ = wrap(`<p>Call us at (905) 555-0100.</p>`);
    expect(extractContactEmail($)).toBeNull();
  });
});

describe("findContactUrl", () => {
  const base = "https://oakvilledental.com";

  it("resolves a relative contact link to an absolute same-origin URL", () => {
    const $ = wrap(`<a href="/contact-us">Contact Us</a>`);
    expect(findContactUrl($, base)).toBe("https://oakvilledental.com/contact-us");
  });

  it("matches on link text when the href is opaque", () => {
    const $ = wrap(`<a href="/p/123">Get in touch</a>`);
    expect(findContactUrl($, base)).toBe("https://oakvilledental.com/p/123");
  });

  it("ignores off-site links and the homepage itself", () => {
    const $ = wrap(
      `<a href="https://facebook.com/contact">fb</a><a href="/">Contact home</a>`,
    );
    expect(findContactUrl($, base)).toBeNull();
  });

  it("returns null when there is no contact link", () => {
    const $ = wrap(`<a href="/services">Services</a>`);
    expect(findContactUrl($, base)).toBeNull();
  });
});
