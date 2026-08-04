#!/usr/bin/env node

import filePath from "./cli/index.js";
import { readSqlFile, splitQueries } from "./parser/sqlParser.js";

/**
 * TODO: CLI entrypoint. This is the only module that should touch
 * process.argv, process.exit/process.exitCode, or console.log/console.error.
 *
 * Wiring: parseCliArgs(process.argv) -> resolveConfig(...) -> runAudit(...).
 *
 * Error handling: catch CliUsageError, ConfigError, FileAccessError, and
 * DatabaseConnectionError (src/errors.ts) specifically. For each, print a
 * clear one-line message to stderr and set a non-zero exit code — this is
 * what REQ-001 means by "not a stack trace". Let genuinely unexpected errors
 * still be visible (don't swallow real bugs), but that's a fallback path,
 * not the normal one.
 *
 * On success: print the report string to stdout, exit 0.
 */

async function main() {
  try {
    console.log("Reading SQL file...\n");
    if (!filePath) {
      throw new Error(
        "No SQL file path provided. Please provide a valid path to the SQL file.",
      );
    }
    const sqlFilePath = await readSqlFile(filePath);
    const queries = splitQueries(sqlFilePath);

    if (queries.length === 0) {
      throw new Error("No SQL queries found in the provided file.");
    }

    console.log(
      `Found ${queries.length} quer${queries.length > 1 ? "ies" : "y"}.\n`,
    );

    for (const query of queries) {
      console.log("-----------------------------------------");
      console.log(`Query ID: ${query.id}`);
      console.log("-----------------------------------------");
      console.log(`Query: ${query.query}`);
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Error: ${err.message}`);
    }
    process.exit(1);
  }
}

main();
