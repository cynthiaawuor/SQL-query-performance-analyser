/**
 * One flag raised by a detector (REQ-005-008) against a single query.
 */
export interface Finding {
  /** Machine-readable rule id, e.g. "high-cost", "full-table-scan". */
  rule: string;
  /** Human-readable summary — what the report shows. */
  message: string;
  /** The concrete facts behind the finding, e.g. { estimatedCost, costThreshold } or { table, rows }. */
  evidence: Record<string, number | string>;
}
