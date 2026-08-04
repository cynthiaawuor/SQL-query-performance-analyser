import type { Query } from "./query.js";
import type { QueryMetrics } from "./metrics.js";

/**
 * `status` is "ok" once a plan was obtained and its metrics extracted,
 * "error" if EXPLAIN ANALYZE failed for this statement (bad SQL, missing
 * table, etc — REQ-002/REQ-003 say one bad statement must not stop the run).
 * A later phase (REQ-005-008) will add `findings` alongside `metrics` on
 * the "ok" case.
 */
export interface QueryAuditResult {
  statement: Query;
  status: "ok" | "error";
  metrics?: QueryMetrics;
  errorMessage?: string;
}
