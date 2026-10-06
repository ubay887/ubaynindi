import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { handleIncoming, type HandlerDeps, type TelegramApi } from "@/server/telegram/handle";
import { secretMatches, telegramWebhookSecret } from "@/server/telegram/secret";
import { escapeHtml, formatPage, parseAdminIds, readUpdate, type WishView } from "@/server/telegram/text";

const entry: WishView = {
  id: "81f47930-b816-4da5-bfa4-d8924ad9d360",
  name: "Ana <3",
  message: "Semoga sakinah & bahagia.",
  attendance: "hadir",
  guestCount: 2,
  createdAt: "2026-10-06T02:42:13.000Z",
};

function deps(adminIds: number[] = [7]): HandlerDeps & { sent: string[]; removed: string[] } {
  const sent: string[] = [];
  const removed: string[] = [];
  const api: TelegramApi = {
    send: vi.fn(async (_chatId, text) => { sent.push(text); }),
    edit: vi.fn(async (_chatId, _messageId, text) => { sent.push(text); }),
    answer: vi.fn(async () => undefined),
  };
  return {
    adminIds: new Set(adminIds),
    sent,
    removed,
    api,
    guestbook: {
      page: async () => ({ entries: [entry], total: 1 }),
      match: async (prefix) => entry.id.startsWith(prefix.toLowerCase()) || entry.id.startsWith(prefix) ? [entry] : [],
      remove: async (id) => {
        removed.push(id);
        return id === entry.id ? entry : null;
      },
    },
  };
}

describe("telegram admin", () => {
  it("keeps the webhook secret label aligned with the setup script", () => {
    const secret = telegramWebhookSecret("test-key");
    expect(secret).toMatch(/^[A-Za-z0-9_-]{20,48}$/);
    expect(secretMatches(secret, secret)).toBe(true);
    expect(secretMatches("other", secret)).toBe(false);
    expect(readFileSync("scripts/telegram.mjs", "utf8")).toContain("ubaynindi-telegram-webhook-v1");
  });

  it("escapes guestbook text and reads a private message", () => {
    expect(escapeHtml(`A & B <tag>`)).toBe("A &amp; B &lt;tag&gt;");
    expect(parseAdminIds(" 7, no, 0, 42 ")).toEqual(new Set([7, 42]));
    expect(readUpdate({ update_id: 1, message: { text: "/list 2", chat: { id: 9, type: "private" }, from: { id: 7 } } })).toMatchObject({
      kind: "message",
      text: "/list 2",
      fromId: 7,
    });
  });

  it("puts the newest wish above the older ones", () => {
    const older: WishView = { ...entry, id: "11111111-1111-4111-8111-111111111111", name: "Lama", createdAt: "2026-10-05T00:00:00.000Z" };
    const newer: WishView = { ...entry, id: "22222222-2222-4222-8222-222222222222", name: "Baru", createdAt: "2026-10-06T00:00:00.000Z" };
    const text = formatPage([older, newer], 2, 1, 5);
    expect(text.startsWith("Terbaru dulu")).toBe(true);
    expect(text.indexOf("Baru")).toBeLessThan(text.indexOf("Lama"));
  });

  it("lists wishes for an admin and hides them from everyone else", async () => {
    const admin = deps();
    await handleIncoming({ kind: "message", chatId: 9, chatType: "private", fromId: 7, text: "/list" }, admin);
    expect(admin.sent[0]).toContain("Ana &lt;3");
    expect(admin.sent[0]).toContain("81f47930");
    expect(admin.removed).toEqual([]);

    const stranger = deps();
    await handleIncoming({ kind: "message", chatId: 9, chatType: "private", fromId: 8, text: "/list" }, stranger);
    expect(stranger.sent[0]).toContain("hanya untuk admin");
    expect(stranger.sent[0]).not.toContain("Ana");
  });

  it("deletes only after the admin confirms", async () => {
    const admin = deps();
    await handleIncoming({ kind: "message", chatId: 9, chatType: "private", fromId: 7, text: "/hapus 81f47930" }, admin);
    expect(admin.sent[0]).toContain("Hapus ucapan ini?");
    expect(admin.removed).toEqual([]);

    await handleIncoming({
      kind: "callback",
      chatId: 9,
      chatType: "private",
      fromId: 7,
      data: `yes:${entry.id}`,
      callbackId: "cb",
      messageId: 3,
    }, admin);
    expect(admin.removed).toEqual([entry.id]);
  });

  it("ignores a delete callback from a non-admin and messages outside private chat", async () => {
    const stranger = deps();
    await handleIncoming({
      kind: "callback",
      chatId: 9,
      chatType: "private",
      fromId: 8,
      data: `yes:${entry.id}`,
      callbackId: "cb",
      messageId: 3,
    }, stranger);
    expect(stranger.removed).toEqual([]);
    expect(stranger.api.answer).toHaveBeenCalledWith("cb", "Tidak diizinkan.");

    const group = deps();
    await handleIncoming({ kind: "message", chatId: 9, chatType: "group", fromId: 7, text: "/hapus 81f47930" }, group);
    expect(group.sent).toEqual([]);
    expect(group.removed).toEqual([]);
  });
});
