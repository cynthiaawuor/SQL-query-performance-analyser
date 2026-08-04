import type { Client } from "pg";
import type { Query } from "../types/query.js";
import type { QueryAuditResult } from "../types/auditResult.js";
import { explainQuery } from "../db/connection.js";
import { extractQueryMetrics } from "./metrics.js";

/**
 * REQ-002/REQ-003: one statement's failure (bad SQL, missing table) must not
 * stop the run — caught here and turned into an "error" result instead of
 * being thrown up to the caller's loop.
 */
export async function analyseStatement(
  client: Client,
  statement: Query,
): Promise<QueryAuditResult> {
  try {
    const plan = await explainQuery(client, statement.query);
    const metrics = extractQueryMetrics(plan);
    return { statement, status: "ok", metrics };
  } catch (error) {
    return {
      statement,
      status: "error",
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }
}
