import { Client } from "pg";
import { config } from "../config/config.js";

export const connectToDatabase = async (): Promise<Client> => {
  const client = new Client({ connectionString: config.databaseUrl });
  await client.connect();
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
