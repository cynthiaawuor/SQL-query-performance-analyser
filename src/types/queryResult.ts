import type { QueryMetrics } from "./metrics.js";
import type { Query } from "./query.js";

export interface QueryResult {
  query: Query;
  metrics?: QueryMetrics;
  skipped?: boolean;
  error?: string;
}
