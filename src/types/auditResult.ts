import type { Query } from "./query.js";
import type { QueryMetrics } from "./metrics.js";
import type { Finding } from "./finding.js";

/**
 * `status` is "ok" once a plan was obtained and its metrics extracted,
 * "error" if EXPLAIN ANALYZE failed for this statement (bad SQL, missing
 * table, etc — REQ-002/REQ-003 say one bad statement must not stop the run).
 * `findings` (REQ-005-008) only ever gets populated on the "ok" case —
 * detectors need metrics to run against.
 */
export interface QueryAuditResult {
  statement: Query;
  status: "ok" | "error";
  metrics?: QueryMetrics;
  errorMessage?: string;
  findings?: Finding[];
}
