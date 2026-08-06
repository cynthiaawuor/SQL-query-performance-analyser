import type { QueryAuditResult } from "../../types/auditResult.js";

export const detectOverFetchQueries = (
  queries: QueryAuditResult[],
  rowsReturnedThreshold: number,
  rowsExaminedThreshold: number,
) => {
  return queries.map((query) => {
    const isOverFetch =
      query.status === "ok" &&
      query.metrics !== undefined &&
      query.metrics.rowsReturned < rowsReturnedThreshold &&
      query.metrics.rowsExamined > rowsExaminedThreshold;

    if (!isOverFetch) return query;

    const finding = {
      rule: "over-fetch",
      message: `Query examines many rows but returns very few.`,
      evidence: {
        rowsReturned: query.metrics!.rowsReturned,
        rowsExamined: query.metrics!.rowsExamined,
      },
    };
    return {
      ...query,
      findings: [...(query.findings ?? []), finding],
    };
  });
};
