/** One sequential (full-table) scan node found in a plan — REQ-005. */
export interface FullTableScan {
  table: string;
  rows: number;
}

export interface QueryMetrics {
  estimatedCost: number;
  rowsExamined: number;
  rowsReturned: number;
  executionTime: number;
  /** Every Seq Scan node in the plan, one entry each — REQ-005 needs each identified separately. */
  fullTableScans: FullTableScan[];
}
