/**
 * Thrown for bad CLI invocation (missing/unrecognised args). Caught in src/index.ts
 * and turned into a non-zero exit with a clear message, never a raw stack trace.
 */
export class CliUsageError extends Error {}

/**
 * Thrown when the resolved configuration is invalid or incomplete
 * (e.g. no database URL from either a flag or the environment).
 */
export class ConfigError extends Error {}

/**
 * Thrown when the SQL file path is missing, unreadable, or not a file.
 */
export class FileAccessError extends Error {}

/**
 * Thrown when the configured database cannot be reached.
 */
export class DatabaseConnectionError extends Error {}
