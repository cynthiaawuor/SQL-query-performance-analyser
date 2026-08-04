export interface OverFetchBoundaries {
  /** Rows examined above which a query is a candidate for the over-fetch rule (REQ-007). */
  minRowsExamined: number;
  /** Rows returned below which a query is a candidate for the over-fetch rule (REQ-007). */
  maxRowsReturned: number;
}

/**
 * Fully resolved, validated configuration for one run of the tool.
 * Every field here is something REQ-001 requires to be configurable —
 * none of it should ever be a literal buried in analysis/report code.
 */
export interface AppConfig {
  sqlFilePath: string;
  databaseUrl: string;
  costThreshold: number;
  overFetch: OverFetchBoundaries;
  /** Below this row count, a full-table scan isn't flagged (REQ-005). */
  smallTableRowThreshold: number;
}
