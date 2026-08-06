import { type FullTableScan, type QueryMetrics } from "../types/metrics.js";

/**
 * Shape of one node in Postgres's `EXPLAIN (ANALYZE, FORMAT JSON)` output.
 * Only the fields we actually read are listed — the real plan has many more.
 */
interface PlanNode {
  "Node Type"?: string;
  "Total Cost"?: number;
  "Actual Rows"?: number;
  "Actual Loops"?: number;
  /** Table name — only present on scan nodes (Seq Scan, Index Scan, ...). */
  "Relation Name"?: string;
  Plans?: PlanNode[];
}

/** Rows a node actually read: "Actual Rows" is a per-loop average, so multiply by loop count. */
const nodeRowsExamined = (node: PlanNode): number =>
  (node["Actual Rows"] ?? 0) * (node["Actual Loops"] ?? 1);

interface ExplainPlan {
  Plan: PlanNode;
  /** Total statement execution time in ms, including all nodes and loops. */
  "Execution Time": number;
}

/**
 * REQ-004: "rows examined" for a query with more than one scan node.
 *
 * We sum "Actual Rows" for every scan-type node in the plan (SCAN_NODES
 * below), not just the root node. A node under a nested loop can run more
 * than once ("Actual Loops" > 1, e.g. an index lookup repeated once per
 * outer row), and each of those loops reads "Actual Rows" rows again, so we
 * multiply by the loop count to get the true total rows read.
 */

const SCAN_NODES = new Set([
  "Seq Scan",
  "Index Scan",
  "Index Only Scan",
  "Bitmap Heap Scan",
  "Bitmap Index Scan",
]);

const sumRowsExamined = (node: PlanNode): number => {
  let rowsExamined = 0;
  if (node["Node Type"] && SCAN_NODES.has(node["Node Type"])) {
    rowsExamined += nodeRowsExamined(node);
  }
  if (node.Plans) {
    for (const childNode of node.Plans) {
      rowsExamined += sumRowsExamined(childNode);
    }
  }
  return rowsExamined;
};

/**
 * REQ-005: every "Seq Scan" node in the plan reads a whole table instead of
 * using an index — collected separately (not just Index/Bitmap scans, which
 * SCAN_NODES above also counts towards rowsExamined) so each one can be
 * flagged by name. A query can have more than one, e.g. a join of two
 * un-indexed tables, so this returns one entry per node, not a total.
 */
const collectFullTableScans = (node: PlanNode): FullTableScan[] => {
  const ownScan: FullTableScan[] =
    node["Node Type"] === "Seq Scan" && node["Relation Name"]
      ? [{ table: node["Relation Name"], rows: nodeRowsExamined(node) }]
      : [];

  const childScans = (node.Plans ?? []).flatMap(collectFullTableScans);
  return [...ownScan, ...childScans];
};

export const extractQueryMetrics = (plan: ExplainPlan): QueryMetrics => {
  return {
    estimatedCost: plan.Plan["Total Cost"] ?? 0,
    rowsReturned: plan.Plan["Actual Rows"] ?? 0,
    executionTime: plan["Execution Time"],
    rowsExamined: sumRowsExamined(plan.Plan),
    fullTableScans: collectFullTableScans(plan.Plan),
  };
};
