import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import pg from "pg";

const { Pool } = pg;
const LOCK_ID = 7148991203;
const root = process.cwd();

function databaseUrl() {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) throw new Error("Missing DATABASE_URL. Configure .env.local or Coolify secrets.");
  return value;
}

async function migrations() {
  const files = (await readdir(join(root, "migrations"))).filter((file) => /^\d+[-_].+\.sql$/i.test(file));
  const result = [];
  for (const name of files) {
    const version = Number(name.match(/^(\d+)/)[1]);
    const sql = await readFile(join(root, "migrations", name), "utf8");
    result.push({ version, name, sql, checksum: createHash("sha256").update(sql).digest("hex") });
  }
  result.sort((a, b) => a.version - b.version);
  return result;
}

export function createPool() {
  return new Pool({
    connectionString: databaseUrl(),
    max: 2,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 10_000,
    statement_timeout: 10_000,
    application_name: "ubaynindi-maintenance",
  });
}

export async function runMigrations(pool) {
  const list = await migrations();
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock($1)", [LOCK_ID]);
    await client.query("BEGIN");
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (version integer PRIMARY KEY, name text NOT NULL, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())`);
    const current = await client.query("SELECT version, checksum FROM schema_migrations ORDER BY version");
    const applied = new Map(current.rows.map((row) => [row.version, row.checksum]));
    const newlyApplied = [];
    for (const migration of list) {
      if (applied.has(migration.version)) {
        if (applied.get(migration.version) !== migration.checksum) throw new Error(`Migration checksum mismatch: ${migration.name}`);
        continue;
      }
      await client.query(migration.sql);
      await client.query("INSERT INTO schema_migrations (version, name, checksum) VALUES ($1, $2, $3)", [migration.version, migration.name, migration.checksum]);
      newlyApplied.push(migration.version);
    }
    await client.query("COMMIT");
    return { list, newlyApplied };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [LOCK_ID]).catch(() => undefined);
    client.release();
  }
}

export async function getMigrationStatus(pool) {
  const list = await migrations();
  const table = await pool.query("SELECT to_regclass('public.schema_migrations') AS name");
  if (!table.rows[0]?.name) return { list, applied: [], pending: list.map((migration) => migration.version) };
  const current = await pool.query("SELECT version, checksum FROM schema_migrations ORDER BY version");
  const applied = current.rows.map((row) => ({ version: row.version, checksum: row.checksum }));
  for (const row of applied) {
    const migration = list.find((item) => item.version === row.version);
    if (!migration || migration.checksum !== row.checksum) throw new Error(`Migration checksum mismatch at version ${row.version}`);
  }
  return { list, applied, pending: list.filter((migration) => !applied.some((row) => row.version === migration.version)).map((migration) => migration.version) };
}
