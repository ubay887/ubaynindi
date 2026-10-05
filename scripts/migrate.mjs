import { createPool, runMigrations } from "./db.mjs";

const started = Date.now();
const pool = createPool();
try {
  const { list, newlyApplied } = await runMigrations(pool);
  console.log(JSON.stringify({ event: "db_migrations_complete", applied: newlyApplied, latest: list.at(-1)?.version ?? 0, elapsedMs: Date.now() - started }));
} catch (error) {
  console.error(JSON.stringify({ event: "db_migrations_failed", error: error instanceof Error ? error.message : "unknown", elapsedMs: Date.now() - started }));
  process.exitCode = 1;
} finally {
  await pool.end();
}
