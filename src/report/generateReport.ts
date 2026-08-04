import type { QueryAuditResult } from "../analyzer/types.js";

/**
 * TODO (phase 1 stub): Render the collected per-statement results into an
 * output string.
 * - For each result: show its position and status. There's no plan/metrics/
 *   findings yet (phases 2–4 add those) — just prove the pipeline is wired
 *   end to end.
 * - An empty `results` array is the "nothing to analyse" outcome (REQ-002) —
 *   render that as an explicit, readable message, not an empty string.
 * - Keep this function's signature (results in, string out) stable — REQ-009
 *   will replace the body with real Markdown severity-grouped output without
 *   needing to change how the rest of the app calls it.
 */
export function generateReport(results: QueryAuditResult[]): string {
  throw new Error("not implemented");
}
