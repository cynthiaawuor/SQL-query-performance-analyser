import type { QueryAuditResult } from "../types/auditResult.js";

/**
 * REQ-009: render the collected per-statement results as Markdown, one
 * section per query — its SQL, its metrics (or error), and any findings.
 */
export function generateReport(results: QueryAuditResult[]): string {
  if (results.length === 0) {
    return "# SQL Query Performance Report\n\nNo SQL statements were found to analyse.\n";
  }

  const sections = results.map(renderQuerySection);
  return `# SQL Query Performance Report\n\n${sections.join("\n")}`;
}

function renderQuerySection(result: QueryAuditResult): string {
  const heading = `## Query ${result.statement.id}\n\n\`\`\`sql\n${result.statement.query}\n\`\`\``;

  if (result.status === "error") {
    return `${heading}\n\n**Error:** ${result.errorMessage}\n`;
  }

  const metrics = result.metrics!;
  const metricsBlock = [
    `- Estimated cost: ${metrics.estimatedCost}`,
    `- Rows examined: ${metrics.rowsExamined}`,
    `- Rows returned: ${metrics.rowsReturned}`,
    `- Execution time: ${metrics.executionTime} ms`,
  ].join("\n");

  const findings = result.findings ?? [];
  const findingsBlock =
    findings.length === 0
      ? "No issues found."
      : `**Findings:**\n${findings.map((finding) => `- **${finding.rule}**: ${finding.message}`).join("\n")}`;

  return `${heading}\n\n${metricsBlock}\n\n${findingsBlock}\n`;
}
