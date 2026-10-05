import "server-only";

import { createHmac, randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import type { InviteSide, Wish } from "@/types/wedding";
import { getServerEnv } from "@/server/env";
import { getPool } from "@/server/db/pool";
import { encodeCursor, type GuestbookCursor } from "@/server/guestbook/cursor";
import type { GuestbookInput } from "@/server/guestbook/schema";

export type PublicEntry = Wish & { id: string; createdAt: string };

function toEntry(row: Record<string, unknown>): PublicEntry {
  return {
    id: String(row.id),
    name: String(row.guest_name),
    message: String(row.message),
    attendance: row.attendance as Wish["attendance"],
    guestCount: row.guest_count === null ? undefined : Number(row.guest_count),
    side: row.side as InviteSide | undefined,
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

export async function listEntries(limit: number, cursor: GuestbookCursor | null) {
  const values: unknown[] = [];
  let condition = "";
  if (cursor) {
    values.push(cursor.createdAt, cursor.id);
    condition = `WHERE (created_at, id) < ($${values.length - 1}, $${values.length})`;
  }
  values.push(limit + 1);
  const result = await getPool().query(
    `SELECT id, guest_name, message, attendance, guest_count, side, created_at
     FROM guestbook_entries ${condition}
     ORDER BY created_at DESC, id DESC
     LIMIT $${values.length}`,
    values,
  );
  const rows = result.rows as Record<string, unknown>[];
  const page = rows.slice(0, limit).map(toEntry);
  const last = rows.length > limit ? page.at(-1) : undefined;
  return {
    entries: page,
    nextCursor: last ? encodeCursor({ createdAt: last.createdAt, id: last.id }) : null,
  };
}

function clientKeyForDay(raw: string, day: string) {
  const env = getServerEnv();
  return createHmac("sha256", env.rateLimitHmacSecret).update(`${day}:${raw}`).digest("hex");
}

async function claimLimit(client: PoolClient, scope: string, key: string, now: Date, limit: number) {
  const windowStart = new Date(Math.floor(now.getTime() / 60_000) * 60_000);
  const expiresAt = new Date(windowStart.getTime() + 60_000);
  const result = await client.query(
    `INSERT INTO submission_limits (scope, client_key, window_start, count, expires_at)
     VALUES ($1, $2, $3, 1, $4)
     ON CONFLICT (scope, client_key, window_start)
     DO UPDATE SET count = submission_limits.count + 1
     WHERE submission_limits.count < $5
     RETURNING count`,
    [scope, key, windowStart.toISOString(), expiresAt.toISOString(), limit],
  );
  return result.rowCount === 1;
}

export function deriveRateLimitKey(address: string, date = new Date()) {
  return clientKeyForDay(address, date.toISOString().slice(0, 10));
}

export async function createEntry(input: GuestbookInput, submissionKey: string, clientIdentity: string | null) {
  const pool = getPool();
  const client = await pool.connect();
  const now = new Date();
  try {
    await client.query("BEGIN");
    const id = randomUUID();
    const inserted = await client.query(
      `INSERT INTO guestbook_entries (id, submission_key, guest_name, attendance, guest_count, message, side)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (submission_key) DO NOTHING
       RETURNING id`,
      [id, submissionKey, input.guestName, input.attendance, input.guestCount, input.message, input.side],
    );
    if (inserted.rowCount === 0) {
      const existing = await client.query(
        `SELECT id, guest_name, message, attendance, guest_count, side, created_at
         FROM guestbook_entries WHERE submission_key = $1`,
        [submissionKey],
      );
      if (!existing.rowCount) throw new Error("IDEMPOTENCY_CONFLICT");
      await client.query("COMMIT");
      return { entry: toEntry(existing.rows[0] as Record<string, unknown>), replayed: true };
    }

    const perClientKey = clientIdentity ? deriveRateLimitKey(clientIdentity, now) : "global-only";
    const clientAllowed = clientIdentity ? await claimLimit(client, "client", perClientKey, now, 5) : true;
    const globalAllowed = await claimLimit(client, "global", "all", now, 30);
    if (!clientAllowed || !globalAllowed) {
      await client.query("ROLLBACK");
      return { entry: null, replayed: false, limited: true };
    }

    const created = await client.query(
      `SELECT id, guest_name, message, attendance, guest_count, side, created_at
       FROM guestbook_entries WHERE id = $1`,
      [id],
    );
    await client.query("COMMIT");
    return { entry: toEntry(created.rows[0] as Record<string, unknown>), replayed: false };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export async function cleanupExpiredLimits(batch = 500) {
  const result = await getPool().query(
    `DELETE FROM submission_limits WHERE expires_at < now()
     AND ctid IN (SELECT ctid FROM submission_limits WHERE expires_at < now() LIMIT $1)`,
    [Math.max(1, Math.min(batch, 5_000))],
  );
  return result.rowCount ?? 0;
}
