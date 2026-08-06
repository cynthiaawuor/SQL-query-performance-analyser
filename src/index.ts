#!/usr/bin/env node

import filePath from "./cli/index.js";
import {
  CliUsageError,
  ConfigError,
  DatabaseConnectionError,
  FileAccessError,
} from "./errors.js";
import { runAudit } from "./runAudit.js";

/**
 * CLI entrypoint. This is the only module that touches process.argv,
 * process.exitCode, or console.log/console.error — everything else in the
 * pipeline stays ignorant of how it was invoked.
 */

async function main() {
  try {
    if (!filePath) {
      throw new CliUsageError(
        "No SQL file path provided. Please provide a valid path to the SQL file.",
      );
    }
    const report = await runAudit(filePath);
    console.log(report);
  } catch (err) {
    if (
      err instanceof CliUsageError ||
      err instanceof ConfigError ||
      err instanceof FileAccessError ||
      err instanceof DatabaseConnectionError
    ) {
      console.error(`Error: ${err.message}`);
      return process.exit(1);
    }
    // Not one of our known failure modes — let it surface with its full
    // stack trace instead of hiding a real bug behind a clean one-liner.
    throw err;
  }
}

main();
