import { Command } from "commander";

/**
 * Raw values straight off the command line / commander — no defaults applied,
 * no validation beyond what commander itself does. Turning this into a fully
 * resolved, validated AppConfig is resolveConfig's job (src/config/config.ts),
 * not this module's.
 */
export interface CliArgs {
  sqlFilePath: string;
  databaseUrl?: string;
  costThreshold?: number;
  minRowsExamined?: number;
  maxRowsReturned?: number;
  smallTableRowThreshold?: number;
}

/**
 * REQ-001: the CLI surface. One required positional argument (the SQL
 * file), plus an optional flag per threshold so nothing is hardcoded at
 * the call site that uses it. Values here are raw and unvalidated — a flag
 * left unset might still be satisfied by an env var, which is
 * config.ts/resolveConfig's job, not this module's. Malformed invocations
 * (e.g. no file path at all) are left to commander's own default
 * behaviour — it prints a usage message and exits non-zero itself, without
 * needing to route through CliUsageError, because parsing runs at import
 * time, before index.ts's try/catch exists to catch anything.
 */
const program = new Command();

program
  .name("sql-query-performance-analyser")
  .description(
    "Analyse SQL query performance against a PostgreSQL database.",
  )
  .argument("<sqlFilePath>", "Path to the .sql file to analyze.")
  .option(
    "--database-url <url>",
    "Postgres connection string (falls back to the DATABASE_URL env var).",
  )
  .option(
    "--cost-threshold <n>",
    "EXPLAIN cost above which a query is flagged as high-cost (falls back to COST_THRESHOLD, default 1000).",
    Number,
  )
  .option(
    "--min-rows-examined <n>",
    "Rows examined above which a query is an over-fetch candidate (falls back to ROWS_EXAMINED_THRESHOLD, default 1000).",
    Number,
  )
  .option(
    "--max-rows-returned <n>",
    "Rows returned below which a query is an over-fetch candidate (falls back to ROWS_RETURNED_THRESHOLD, default 10).",
    Number,
  )
  .option(
    "--small-table-threshold <n>",
    "Row count at or below which a full-table scan isn't flagged (falls back to SMALL_TABLE_ROW_THRESHOLD, default 100).",
    Number,
  );

program.parse();

const opts = program.opts();

export const cliArgs: CliArgs = {
  // Non-null: commander's own "<sqlFilePath>" (required, not "[sqlFilePath]")
  // already exits with a usage error before this line runs if it's missing.
  sqlFilePath: program.args[0]!,
  databaseUrl: opts.databaseUrl,
  costThreshold: opts.costThreshold,
  minRowsExamined: opts.minRowsExamined,
  maxRowsReturned: opts.maxRowsReturned,
  smallTableRowThreshold: opts.smallTableThreshold,
};

const filePath = cliArgs.sqlFilePath;
export default filePath;
