import dotenv from "dotenv";

/**
 * TODO (REQ-001): Merge CLI flags and environment variables into one AppConfig.
 * - Precedence: explicit CLI flag > environment variable > documented default.
 * - Env vars to support (document these in the README once finalised):
 *     DATABASE_URL, COST_THRESHOLD, MIN_ROWS_EXAMINED, MAX_ROWS_RETURNED,
 *     SMALL_TABLE_ROW_THRESHOLD
 * - Validate: databaseUrl must end up set from somewhere, sqlFilePath must be
 *   a non-empty string. Throw ConfigError (src/errors.ts) with a message that
 *   tells the user exactly what's missing — this is what turns "no database"
 *   into a clear failure instead of a crash deep inside the db module.
 * - Pick and document real defaults for costThreshold and smallTableRowThreshold —
 *   REQ-007's over-fetch boundaries (1000 examined / 10 returned) are given by
 *   the spec, but confirm in the README whether you're keeping them fixed or
 *   letting them be overridden too.
 */

dotenv.config();
export const config = () => {
  databaseUrl: process.env.DATABASE_URL || "";
  // costThreshold: Number(process.env.COST_THRESHOLD || 1000),
};
