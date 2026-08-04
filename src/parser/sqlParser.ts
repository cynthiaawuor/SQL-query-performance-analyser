import type { Query } from "../types/query.js";
import fs from "node:fs/promises";
/**
 * TODO (REQ-002): Split raw SQL file content into individual statements.
 * - Split on ';' — but not a ';' that appears inside a string literal
 *   ('...' or "...") or inside a comment.
 * - Strip '--' line comments and slash-star block comments.
 * - Skip anything that's blank/whitespace-only after stripping.
 * - Number the surviving statements by their order in the file (1-based).
 *   An empty file, or a file containing only comments, should naturally
 *   fall out of this as an empty array — that's the "nothing to analyse"
 *   case; don't special-case it here, let the caller decide what to report.
 *
 * Edge cases worth testing once this exists (REQ-011 will ask for these):
 * - a ';' inside a string literal, e.g. WHERE name = 'a;b'
 * - a '--' inside a string literal
 * - a trailing statement with no closing ';'
 * - Windows line endings / mixed whitespace around statements
 */

export async function readSqlFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (error) {
    throw new Error(`Failed to read SQL file at ${filePath}: ${error}`);
  }
}

export function splitQueries(sql: string): Query[] {
  //Remove sql comments
  const sqlWithoutComments = sql.replace(/--.*$/gm, "");

  //split on semicolon
  const queries = sqlWithoutComments.split(";").map((query, index) => {
    //trim whitespace
    const trimmedQuery = query.trim();
    if (trimmedQuery.length > 0) {
      return {
        id: index + 1,
        query: trimmedQuery,
      };
    }
  });
  return queries.filter((query) => query !== undefined);
}
