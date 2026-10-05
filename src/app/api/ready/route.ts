import { getLatestMigrationVersion } from "@/server/db/migrate";
import { getPool } from "@/server/db/pool";
import { getServerEnv } from "@/server/env";

export const runtime = "nodejs";

export async function GET() {
  try {
    getServerEnv();
    const latest = await getLatestMigrationVersion();
    const result = await getPool().query<{ version: number }>(
      "SELECT COALESCE(MAX(version), 0)::int AS version FROM schema_migrations",
    );
    const applied = result.rows[0]?.version ?? 0;
    if (applied < latest) {
      return Response.json({ status: "not_ready", reason: "migration_pending" }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
    return Response.json({ status: "ready", migration: applied }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ status: "not_ready", reason: "database_unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
