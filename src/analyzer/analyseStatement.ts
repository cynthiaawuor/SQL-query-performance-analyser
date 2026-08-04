import type { ParsedStatement } from "../parser/types.js";
import type { QueryAuditResult } from "./types.js";

/**
 * TODO (phase 1 stub): For now this just wraps a parsed statement as
 * "pending" — no EXPLAIN, no detectors yet, that's phases 2–4. The point of
 * having this function exist now, doing almost nothing, is to keep analysis
 * a separate stage from parsing/db/reporting from day one (REQ-001), so
 * later phases extend this function's body instead of restructuring the
 * pipeline around it.
 *
 * REQ-002 also lives partly here: if running/parsing this specific statement
 * fails later (phase 2+), that failure must be captured as an "error" result
 * tied to this statement's position — not thrown up to abort the whole run.
 */
export function analyseStatement(statement: ParsedStatement): QueryAuditResult {
  throw new Error("not implemented");
}
