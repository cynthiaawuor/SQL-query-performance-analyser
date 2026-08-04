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
 * TODO (REQ-001): Define the CLI surface using commander.
 * - One required positional argument: the path to the SQL file.
 * - Flags (each configurable, per REQ-001/006/007, so nothing below is hardcoded
 *   at the call site that uses it):
 *     --database-url <url>          (falls back to DATABASE_URL env var)
 *     --cost-threshold <n>
 *     --min-rows-examined <n>
 *     --max-rows-returned <n>
 *     --small-table-threshold <n>
 * - Give every flag help text explaining what it configures — this doubles as
 *   the "documented command" REQ-001 asks for.
 * - Return the parsed args as-is. Don't throw here for "missing config" —
 *   a missing flag might still be satisfied by an env var, which is
 *   resolveConfig's concern. Do throw a CliUsageError for actually malformed
 *   invocations (e.g. no file path given at all).
 */

const program = new Command();

program
  .name("sql-query-performance-analyser")
  .description(
    "Analyse SQL query performance based on cost and row thresholds.",
  )
  .argument("<sqlFilePath>", "Path to the SQL file to analyze.");

program.parse();

const filePath = program.args[0];
export default filePath;
