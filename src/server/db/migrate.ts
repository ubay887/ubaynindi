import "server-only";

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import type { PoolClient } from "pg";
import { getPool } from "@/server/db/pool";

const MIGRATION_LOCK = 7_148_991_203;
const migrationDir = join(process.cwd(), "migrations");

type Migration = { version: number; name: string; sql: string; checksum: string };

function parseMigrationName(name: string) {
  const match = name.match(/^(\d+)[-_](.+)\.sql$/i);
  if (!match) return null;
  return { version: Number(match[1]), name };
}

async function loadMigrations(): Promise<Migration[]> {
  const { readdir } = await import("node:fs/promises");
  const files = (await readdir(migrationDir)).filter((file) => parseMigrationName(file));
  const migrations = await Promise.all(
    files.map(async (file) => {
      const parsed = parseMigrationName(file);
      if (!parsed) throw new Error(`Invalid migration filename: ${file}`);
      const sql = await readFile(join(migrationDir, file), "utf8");
      return {
        version: parsed.version,
        name: basename(file),
        sql,
        checksum: createHash("sha256").update(sql).digest("hex"),
      };
    }),
  );
  migrations.sort((a, b) => a.version - b.version);
  for (let index = 1; index < migrations.length; index += 1) {
    if (migrations[index - 1].version === migrations[index].version) {
      throw new Error(`Duplicate migration version: ${migrations[index].version}`);
    }
  }
  return migrations;
}

async function ensureMigrationTable(client: PoolClient) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version integer PRIMARY KEY,
      name text NOT NULL,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

export async function getLatestMigrationVersion(): Promise<number> {
  const migrations = await loadMigrations();
  return migrations.at(-1)?.version ?? 0;
}

export async function migrateDatabase(): Promise<{ applied: number[]; latest: number }> {
  const migrations = await loadMigrations();
  const client = await getPool().connect();
  const started = Date.now();
  try {
    await client.query("SET lock_timeout = '5000ms'");
    await client.query("SELECT pg_advisory_lock($1)", [MIGRATION_LOCK]);
    await client.query("BEGIN");
    await ensureMigrationTable(client);
    const appliedRows = await client.query<{ version: number; name: string; checksum: string }>(
      "SELECT version, name, checksum FROM schema_migrations ORDER BY version",
    );
    const applied = new Map(appliedRows.rows.map((row) => [row.version, row]));
    for (const migration of migrations) {
      const existing = applied.get(migration.version);
      if (existing && existing.checksum !== migration.checksum) {
        throw new Error(`Migration checksum mismatch: ${migration.name}`);
      }
      if (existing) continue;
      await client.query(migration.sql);
      await client.query(
        "INSERT INTO schema_migrations (version, name, checksum) VALUES ($1, $2, $3)",
        [migration.version, migration.name, migration.checksum],
      );
    }
    await client.query("COMMIT");
    const appliedVersions = migrations.filter((migration) => !applied.has(migration.version)).map((migration) => migration.version);
    console.log(JSON.stringify({ event: "db_migrations_complete", applied: appliedVersions, latest: migrations.at(-1)?.version ?? 0, elapsedMs: Date.now() - started }));
    return { applied: appliedVersions, latest: migrations.at(-1)?.version ?? 0 };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error(JSON.stringify({ event: "db_migrations_failed", error: error instanceof Error ? error.message : "unknown", elapsedMs: Date.now() - started }));
    throw error;
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [MIGRATION_LOCK]).catch(() => undefined);
    client.release();
  }
}
