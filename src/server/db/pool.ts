import "server-only";

import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { getServerEnv } from "@/server/env";

declare global {
  var __ubaynindiPool: Pool | undefined;
}

export function getPool(): Pool {
  if (globalThis.__ubaynindiPool) return globalThis.__ubaynindiPool;

  const env = getServerEnv();
  const pool = new Pool({
    connectionString: env.databaseUrl,
    max: 5,
    connectionTimeoutMillis: 3_000,
    idleTimeoutMillis: 30_000,
    statement_timeout: 4_000,
    query_timeout: 5_000,
    application_name: "ubaynindi-invitation",
  });
  pool.on("error", (error) => {
    console.error(JSON.stringify({ event: "postgres_pool_error", name: error.name }));
  });
  globalThis.__ubaynindiPool = pool;
  return pool;
}

export async function withClient<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

export async function query<T extends QueryResultRow>(
  text: string,
  values: unknown[] = [],
) {
  return getPool().query<T>(text, values);
}
