import { analyseStatement } from "./analyzer/analyseStatement.js";
import { detectFullTableScans } from "./analyzer/detectors/fullTableScan.js";
import { detectHighCostQueries } from "./analyzer/detectors/highCost.js";
import { detectOverFetchQueries } from "./analyzer/detectors/overFetch.js";
import { config, validateConfig } from "./config/config.js";
import { connectToDatabase } from "./db/connection.js";
import { FileAccessError } from "./errors.js";
import { readSqlFile, splitQueries } from "./parser/sqlParser.js";
import { generateReport } from "./report/generateReport.js";
import type { QueryAuditResult } from "./types/auditResult.js";

export const runAudit = async (filePath: string) => {
  // REQ-001: fail fast with a clear ConfigError before touching the
  // filesystem or the database if the config is incomplete.
  validateConfig();

  // REQ-002: a missing/unreadable file surfaces as FileAccessError, not
  // whatever raw error readSqlFile happened to throw.
  let file: string;
  try {
    file = await readSqlFile(filePath);
  } catch (error) {
    throw new FileAccessError(
      `Could not read SQL file at "${filePath}": ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  //   If there are zero statements, short-circuit straight to generateReport
  //   with an empty list — that's the "nothing to analyse" case (REQ-002).
  const queries = splitQueries(file);

  if (queries.length === 0) {
    return generateReport([]);
  }
  // fail fast, before doing any per-statement work,
  //  per REQ-001's "no database" requirement.
  const client = await connectToDatabase();

  try {
    const results: QueryAuditResult[] = [];
    for (const query of queries) {
      const result = await analyseStatement(client, query);
      results.push(result);
    }
    // REQ-005/006/007: each detector re-reads the full result set and
    // appends its own findings — order between them doesn't matter, since
    // none of them remove queries or overwrite another's findings.
    let auditedResults = results;

    auditedResults = detectHighCostQueries(
      auditedResults,
      config.costThreshold,
    );
    auditedResults = detectOverFetchQueries(
      auditedResults,
      config.rowsReturnedThreshold,
      config.rowsExaminedThreshold,
    );
    auditedResults = detectFullTableScans(
      auditedResults,
      config.smallTableRowThreshold,
    );
    return generateReport(auditedResults);
  } finally {
    await client.end();
  }
};
