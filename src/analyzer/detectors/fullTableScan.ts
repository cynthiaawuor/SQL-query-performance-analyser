import type { QueryAuditResult } from "../../types/auditResult.js";

const RULE = "full-table-scan";

/**
 * REQ-005: flag every sequential (full-table) scan in a query's plan whose
 * row count is above `smallTableRowThreshold`. A full scan of a tiny table
 * isn't the same problem as one on a large table — reading all 50 rows of
 * a lookup table is fine, so scans at or below the threshold are not
 * flagged. Index/Bitmap scans never appear here at all (extractQueryMetrics
 * only collects "Seq Scan" nodes into `fullTableScans`), so this rule can't
 * flag an index scan by construction.
 *
 * A query can contain more than one full scan (e.g. joining two un-indexed
 * tables) — each gets its own finding, naming its own table.
 */
export const detectFullTableScans = (
  queries: QueryAuditResult[],
  smallTableRowThreshold: number,
): QueryAuditResult[] => {
  return queries.map((query) => {
    if (query.status !== "ok" || query.metrics === undefined) return query;

    const newFindings = query.metrics.fullTableScans
      .filter((scan) => scan.rows > smallTableRowThreshold)
      .map((scan) => ({
        rule: RULE,
        message: `Full table scan on "${scan.table}" (${scan.rows} rows) instead of using an index.`,
        evidence: {
          table: scan.table,
          rows: scan.rows,
          smallTableRowThreshold,
        },
      }));

    if (newFindings.length === 0) return query;

    return {
      ...query,
      findings: [...(query.findings ?? []), ...newFindings],
    };
  });
};
