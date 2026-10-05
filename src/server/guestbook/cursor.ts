import "server-only";

import { randomUUID } from "node:crypto";

export type GuestbookCursor = { createdAt: string; id: string };

export function encodeCursor(cursor: GuestbookCursor): string {
  const payload = JSON.stringify({ v: 1, createdAt: cursor.createdAt, id: cursor.id });
  return Buffer.from(payload, "utf8").toString("base64url");
}

export function decodeCursor(raw: string | null): GuestbookCursor | null {
  if (!raw) return null;
  if (raw.length > 512 || !/^[A-Za-z0-9_-]+$/.test(raw)) throw new Error("INVALID_CURSOR");
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  } catch {
    throw new Error("INVALID_CURSOR");
  }
  if (!parsed || typeof parsed !== "object") throw new Error("INVALID_CURSOR");
  const value = parsed as Record<string, unknown>;
  if (value.v !== 1 || typeof value.createdAt !== "string" || typeof value.id !== "string") {
    throw new Error("INVALID_CURSOR");
  }
  const date = new Date(value.createdAt);
  if (!Number.isFinite(date.getTime()) || date.toISOString() !== value.createdAt) throw new Error("INVALID_CURSOR");
  if (!/^[0-9a-f-]{36}$/i.test(value.id)) throw new Error("INVALID_CURSOR");
  return { createdAt: value.createdAt, id: value.id };
}

export function newSubmissionId(): string {
  return randomUUID();
}
