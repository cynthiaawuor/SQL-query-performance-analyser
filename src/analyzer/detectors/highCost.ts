import type { QueryAuditResult } from "../../types/auditResult.js";

const RULE = "high-cost";

/**
 * REQ-006: flag any query whose planner-estimated cost exceeds the
 * configured threshold — a query exactly at the threshold is NOT flagged,
 * only one strictly above it.
 *
 * Returns the full result set, same length and order as `queries`, with a
 * finding appended for each flagged query. Other detectors: fullTableScan,overFetch etc
 * need to see every query too, so this must not filter the array down —
 * only annotate it.
 */
export const detectHighCostQueries = (
  queries: QueryAuditResult[],
  costThreshold: number,
): QueryAuditResult[] => {
  return queries.map((query) => {
    const isHighCost =
      query.status === "ok" &&
      query.metrics !== undefined &&
      query.metrics.estimatedCost > costThreshold;

    if (!isHighCost) return query;

    const estimatedCost = query.metrics!.estimatedCost;
    const finding = {
      rule: RULE,
      message: `Estimated cost ${estimatedCost} exceeds the configured threshold of ${costThreshold}`,
      evidence: { estimatedCost, costThreshold },
    };

    return {
      ...query,
      findings: [...(query.findings ?? []), finding],
    };
  });
};
