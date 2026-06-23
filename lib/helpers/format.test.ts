// Libs
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatRelativeDate,
  getAvatarColor,
  getInitials,
} from "@/lib/helpers/format";

describe("getInitials", () => {
  it("takes the first two words' initials, uppercased", () => {
    expect(getInitials("Bright Smiles Dental")).toBe("BS");
    expect(getInitials("netflix")).toBe("N");
    expect(getInitials("")).toBe("");
  });
});

describe("getAvatarColor", () => {
  it("is deterministic and returns a known variant", () => {
    const a = getAvatarColor("lead-123");
    expect(getAvatarColor("lead-123")).toBe(a);
    expect(a).toMatch(/^bg-(muted|foreground|avatar-navy|avatar-green)\b/);
  });
});

describe("formatRelativeDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-18T12:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  const ago = (ms: number) => new Date(Date.now() - ms);

  it("buckets recent times", () => {
    expect(formatRelativeDate(ago(10_000))).toBe("just now");
    expect(formatRelativeDate(ago(5 * 60_000))).toBe("5m ago");
    expect(formatRelativeDate(ago(2 * 3_600_000))).toBe("2h ago");
    expect(formatRelativeDate(ago(3 * 86_400_000))).toBe("3d ago");
  });

  it("falls back to a locale date past 30 days", () => {
    const out = formatRelativeDate(ago(60 * 86_400_000));
    expect(out).not.toMatch(/ago|just now/);
  });
});
