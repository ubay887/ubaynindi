import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

const testDatabase = process.env.TEST_DATABASE_URL;

describe.skipIf(!testDatabase)("isolated PostgreSQL integration contract", () => {
  it("applies migrations, stays idempotent, and prevents duplicate entries", async () => {
    process.env.DATABASE_URL = testDatabase;
    process.env.APP_ORIGIN = "http://127.0.0.1:3000";
    process.env.RATE_LIMIT_HMAC_SECRET = "integration-test-secret-with-at-least-32-chars";
    const { getPool } = await import("@/server/db/pool");
    const { migrateDatabase } = await import("@/server/db/migrate");
    const { createEntry } = await import("@/server/guestbook/repository");
    const { parseGuestbookInput } = await import("@/server/guestbook/schema");

    const first = await migrateDatabase();
    const second = await migrateDatabase();
    expect(first.latest).toBeGreaterThan(0);
    expect(second.applied).toEqual([]);

    const pool = getPool();
    await pool.query("TRUNCATE submission_limits, guestbook_entries");
    const key = randomUUID();
    const input = parseGuestbookInput({ guest_name: "Integration", message: "Doa terbaik.", attendance: "hadir", guest_count: 1, side: "wanita" });
    const created = await createEntry(input, key, null);
    const replay = await createEntry(input, key, null);
    expect(created.replayed).toBe(false);
    expect(replay.replayed).toBe(true);
    expect(replay.entry?.id).toBe(created.entry?.id);
    await expect(pool.query("SELECT count(*)::int AS count FROM guestbook_entries")).resolves.toMatchObject({ rows: [{ count: 1 }] });
    await pool.end();
  });
});
