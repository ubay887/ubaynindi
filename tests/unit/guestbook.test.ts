import { describe, expect, it } from "vitest";
import { decodeCursor, encodeCursor, newSubmissionId } from "@/server/guestbook/cursor";
import { parseGuestbookInput } from "@/server/guestbook/schema";

describe("guestbook schema", () => {
  it("normalizes Unicode and accepts an exact count from 1 through 10", () => {
    const parsed = parseGuestbookInput({
      guest_name: "  A\u0301nd  i  ",
      message: " Semoga menjadi keluarga yang sakinah. ",
      attendance: "hadir",
      guest_count: 10,
      side: "wanita",
      anonymous: false,
    });
    expect(parsed.guestName).toBe("Ánd i");
    expect(parsed.guestCount).toBe(10);
  });

  it("preserves anonymous mode and removes guest count for non-attendance", () => {
    const parsed = parseGuestbookInput({
      guest_name: "Ignored name",
      message: "Doa terbaik.",
      attendance: "ragu",
      guest_count: null,
      anonymous: true,
    });
    expect(parsed.guestName).toBe("Anonim");
    expect(parsed.guestCount).toBeNull();
  });

  it("rejects invalid count boundaries", () => {
    expect(() => parseGuestbookInput({ guest_name: "Ubay", message: "Hadir.", attendance: "hadir", guest_count: 0 })).toThrow("INVALID_GUEST_COUNT");
    expect(() => parseGuestbookInput({ guest_name: "Ubay", message: "Hadir.", attendance: "hadir", guest_count: 11 })).toThrow("INVALID_GUEST_COUNT");
  });
});

describe("guestbook cursor", () => {
  it("round trips a versioned cursor", () => {
    const value = { createdAt: "2026-10-05T10:00:00.000Z", id: "123e4567-e89b-12d3-a456-426614174000" };
    expect(decodeCursor(encodeCursor(value))).toEqual(value);
  });

  it("rejects malformed cursors", () => {
    expect(() => decodeCursor("not-a-cursor")).toThrow("INVALID_CURSOR");
    expect(() => decodeCursor(encodeCursor({ createdAt: "2026-10-05T10:00:00.000Z", id: "bad" }))).toThrow("INVALID_CURSOR");
  });
});

it("creates a UUID-shaped idempotency key", () => {
  expect(newSubmissionId()).toMatch(/^[0-9a-f-]{36}$/i);
});
