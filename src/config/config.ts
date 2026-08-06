import dotenv from "dotenv";
import { cliArgs } from "../cli/index.js";
import { ConfigError } from "../errors.js";

dotenv.config();

/** Precedence: CLI flag > env var > the fallback passed in here. */
function resolveNumber(
  cliValue: number | undefined,
  envVar: string,
  fallback: number,
): number {
  if (cliValue !== undefined) return cliValue;

  const envValue = process.env[envVar];
  if (envValue !== undefined && envValue !== "") {
    const parsed = Number(envValue);
    if (!Number.isNaN(parsed)) return parsed;
  }

  return fallback;
}

export const config = {
  databaseUrl: cliArgs.databaseUrl ?? process.env.DATABASE_URL,
  costThreshold: resolveNumber(cliArgs.costThreshold, "COST_THRESHOLD", 1000),
  rowsExaminedThreshold: resolveNumber(
    cliArgs.minRowsExamined,
    "ROWS_EXAMINED_THRESHOLD",
    1000,
  ),
  rowsReturnedThreshold: resolveNumber(
    cliArgs.maxRowsReturned,
    "ROWS_RETURNED_THRESHOLD",
    10,
  ),
  smallTableRowThreshold: resolveNumber(
    cliArgs.smallTableRowThreshold,
    "SMALL_TABLE_ROW_THRESHOLD",
    100,
  ),
};

/**
 * REQ-001: databaseUrl must end up set from somewhere before any audit work
 * starts. This is a function, not a top-level throw, so a bad config is
 * catchable as a clean ConfigError from inside runAudit's try/catch —
 * throwing at import time would crash before index.ts's error handling
 * ever gets a chance to run.
 */
export function validateConfig(): void {
  if (!config.databaseUrl) {
    throw new ConfigError(
      "No database URL configured. Set the DATABASE_URL environment variable (see .env.example).",
    );
  }
}
