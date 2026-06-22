// Libs
import { describe, expect, it } from "vitest";
import * as cheerio from "cheerio";
import {
  buildSiteSummary,
  deriveFindings,
  extractContactEmail,
  extractSignals,
  findContactUrl,
  type FindingInputs,
} from "@/lib/helpers/siteAudit";
import { EMPTY_SIGNALS } from "@/constants/audit";

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

describe("deriveFindings", () => {
  const goodSignals = {
    ...EMPTY_SIGNALS,
    hasTapToCall: true,
    hasContactForm: true,
    mentionsReviews: true,
    copyrightYear: new Date().getUTCFullYear(),
  };
  const good: FindingInputs = {
    hasHttps: true,
    hasViewportMeta: true,
    performanceScore: 90,
    lcpMs: 1200,
    signals: goodSignals,
    hasTitle: true,
  };
  const keys = (i: FindingInputs) => deriveFindings(i).map((f) => f.key);

  it("flags nothing for a healthy site", () => {
    expect(deriveFindings(good)).toEqual([]);
  });

  it("flags no_https / no_viewport / no_title", () => {
    expect(keys({ ...good, hasHttps: false })).toContain("no_https");
    expect(keys({ ...good, hasViewportMeta: false })).toContain("no_viewport");
    expect(keys({ ...good, hasTitle: false })).toContain("no_title");
  });

  it("flags no_contact_path only when both tap-to-call and form are absent", () => {
    const noTap = keys({
      ...good,
      signals: { ...goodSignals, hasTapToCall: false },
    });
    expect(noTap).toContain("no_tap_to_call");
    expect(noTap).not.toContain("no_contact_path"); // form still present

    const neither = keys({
      ...good,
      signals: { ...goodSignals, hasTapToCall: false, hasContactForm: false },
    });
    expect(neither).toContain("no_contact_path");
  });

  it("flags stale_copyright for an old footer year", () => {
    expect(keys({ ...good, signals: { ...goodSignals, copyrightYear: 2000 } })).toContain(
      "stale_copyright",
    );
  });

  it("flags egregiously_slow for a very high LCP", () => {
    expect(keys({ ...good, lcpMs: 13000 })).toContain("egregiously_slow");
  });
});

describe("extractSignals", () => {
  it("detects tap-to-call, contact form, booking, reviews, social, CTAs, year", () => {
    const $ = wrap(`
      <a href="tel:+19055550100">Call</a>
      <form><input type="email" /></form>
      <a href="https://calendly.com/biz">Book now</a>
      <p>Read our testimonials and reviews</p>
      <a href="https://facebook.com/biz">Facebook</a>
      <a href="/book">Book Now</a>
      <footer>© 2024 Biz Inc</footer>
    `);
    const s = extractSignals($);
    expect(s.hasTapToCall).toBe(true);
    expect(s.hasContactForm).toBe(true);
    expect(s.hasOnlineBooking).toBe(true);
    expect(s.mentionsReviews).toBe(true);
    expect(s.socialLinks).toContain("facebook");
    expect(s.copyrightYear).toBe(2024);
  });

  it("returns empty-ish signals for a bare page and null for an out-of-range year", () => {
    const s = extractSignals(wrap(`<footer>© 1980 Old</footer>`));
    expect(s.hasTapToCall).toBe(false);
    expect(s.hasContactForm).toBe(false);
    expect(s.copyrightYear).toBeNull();
  });
});

describe("buildSiteSummary", () => {
  it("joins title and description with an em dash", () => {
    expect(buildSiteSummary("Title", "Desc")).toBe("Title — Desc");
  });
  it("falls back to (no title) and to title-only", () => {
    expect(buildSiteSummary("", "Desc")).toBe("(no title) — Desc");
    expect(buildSiteSummary("Title", "")).toBe("Title");
  });
});
