import { createPool, getMigrationStatus } from "./db.mjs";

const pool = createPool();
try {
  const { list, pending } = await getMigrationStatus(pool);
  console.log(pending.length ? `Pending migrations: ${pending.join(", ")}` : "No-op: database is already up to date.");
  console.log(`Latest migration: ${list.at(-1)?.version ?? 0}`);
} finally {
  await pool.end();
}
