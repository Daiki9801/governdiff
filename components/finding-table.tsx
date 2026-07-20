import type { MouseEvent } from "react";

import type { Finding } from "../lib/domain/types";

interface FindingTableProps {
  readonly findings: readonly Finding[];
  readonly caption?: string;
  readonly regionLabel?: string;
  readonly onViewEvidence?: (
    finding: Finding,
    trigger: HTMLButtonElement,
  ) => void;
}

export function FindingTable({
  findings,
  caption = "Review findings generated from published baseline v1",
  regionLabel = "Review findings",
  onViewEvidence,
}: FindingTableProps) {
  function handleEvidence(
    event: MouseEvent<HTMLButtonElement>,
    finding: Finding,
  ): void {
    onViewEvidence?.(finding, event.currentTarget);
  }

  return (
    <div className="table-scroll" role="region" aria-label={regionLabel} tabIndex={0}>
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Record</th>
            <th scope="col">Amount</th>
            <th scope="col">Rule</th>
            <th scope="col">Outcome</th>
            <th scope="col">Why</th>
            {onViewEvidence === undefined ? null : <th scope="col">Evidence</th>}
          </tr>
        </thead>
        <tbody>
          {findings.map((finding) => (
            <tr key={finding.findingKey}>
              <td><code>{finding.expenseId}</code></td>
              <td>
                {typeof finding.observed.amount_usd === "string"
                  ? `USD ${finding.observed.amount_usd}`
                  : "—"}
              </td>
              <td><code>{finding.ruleId}</code></td>
              <td>{finding.outcome.replaceAll("_", " ")}</td>
              <td>{finding.message}</td>
              {onViewEvidence === undefined ? null : (
                <td>
                  <button
                    className="evidence-button"
                    type="button"
                    onClick={(event) => handleEvidence(event, finding)}
                  >
                    View evidence
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
