import type { ParsedStatement } from "../parser/types.js";

/**
 * Phase 1 placeholder. This will grow once REQ-003/004 give you a real plan
 * and metrics, and REQ-005–008 give you detectors and index suggestions —
 * at that point `status` gains an "ok" case with a Finding[], not just
 * pending/error. Keep this type as the single seam between analysis and
 * reporting, so the report module never needs to know how a result was
 * produced.
 */
export interface QueryAuditResult {
  statement: ParsedStatement;
  status: "pending" | "error";
  errorMessage?: string;
}
