import { Client } from "pg";
import { config } from "../config/config.js";
import { DatabaseConnectionError } from "../errors.js";

/**
 * A refused/unreachable connection surfaces as Node's AggregateError, whose
 * top-level `.message` is empty — the useful detail (e.g. "ECONNREFUSED")
 * lives on `.code` instead. Falls back through message -> code -> name so
 * the wrapped DatabaseConnectionError is never just "...reachable: ".
 */
function describeConnectionError(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (error.message) return code ? `${error.message} (${code})` : error.message;
    return code ?? error.name;
  }
  return String(error);
}

/**
 * REQ-001: fail fast with a clear message before any analysis work starts.
 * A single Client (not a Pool) is enough — REQ-003 reuses this same handle
 * to run every statement's EXPLAIN ANALYZE sequentially, no concurrent
 * queries needed within one audit run.
 *
 * client.connect() succeeding only proves a TCP handshake happened, not
 * that the database actually works — so we also run a trivial query to
 * prove it. Any failure at either step is wrapped in DatabaseConnectionError
 * with a message useful to someone who mistyped a host or forgot to start
 * Postgres, and the half-open client is always cleaned up before throwing.
 */
export const connectToDatabase = async (): Promise<Client> => {
  const client = new Client({ connectionString: config.databaseUrl });

  try {
    await client.connect();
    // see if the connection to the database is still active and working
    await client.query("SELECT 1");
  } catch (error) {
    await client.end().catch(() => {});
    throw new DatabaseConnectionError(
      `Could not connect to the database at the configured DATABASE_URL. Check that Postgres is running and reachable: ${describeConnectionError(error)}`,
    );
  }

  return client;
};

/**
 * REQ-003: EXPLAIN ANALYZE actually executes the statement, so a raw
 * INSERT/UPDATE/DELETE would leave real data changes behind. Rather than
 * detecting statement type, every statement runs inside a transaction that
 * is always rolled back afterwards — safe for writes, a no-op for SELECTs,
 * and one code path for both.
 */
export const explainQuery = async (client: Client, query: string) => {
  await client.query("BEGIN");
  try {
    const explainSql = `EXPLAIN (ANALYZE, FORMAT JSON) ${query}`;
    const result = await client.query(explainSql);
    return result.rows[0]["QUERY PLAN"][0];
  } finally {
    await client.query("ROLLBACK");
  }
};
