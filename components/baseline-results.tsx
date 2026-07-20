import type { RefObject } from "react";

import type { ReleaseSnapshot } from "../lib/state/demo-state";
import { FindingTable } from "./finding-table";

interface BaselineResultsProps {
  readonly release: ReleaseSnapshot;
  readonly recordCount: number;
  readonly candidateStartEnabled: boolean;
  readonly onStartCandidate: () => void;
  readonly onViewEvidence: (
    finding: ReleaseSnapshot["findings"][number],
    trigger: HTMLButtonElement,
  ) => void;
  readonly headingRef?: RefObject<HTMLHeadingElement | null>;
}

export function BaselineResults({
  release,
  recordCount,
  candidateStartEnabled,
  onStartCandidate,
  onViewEvidence,
  headingRef,
}: BaselineResultsProps) {
  return (
    <section className="panel results-panel" aria-labelledby="results-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Published baseline</p>
          <h2 id="results-heading" ref={headingRef} tabIndex={-1}>
            Baseline v1 is ready
          </h2>
        </div>
        <span className="published-chip">Published</span>
      </div>

      <div className="metrics" aria-label="Baseline summary">
        <div><strong>{release.findings.length}</strong><span>review findings</span></div>
        <div><strong>{recordCount}</strong><span>synthetic records evaluated</span></div>
        <div><strong>v1</strong><span>immutable release</span></div>
      </div>

      <div className="assurance-row">
        <span>Deterministic runtime</span>
        <span>Session-only release</span>
        <span>Sample analysis</span>
      </div>
      <p className="scope-note">
        These are review findings, not fraud, compliance, approval, payment, or reimbursement decisions.
      </p>
      <FindingTable
        findings={release.findings}
        caption="Review findings generated from immutable published baseline v1"
        regionLabel="Published baseline v1 review findings"
        onViewEvidence={onViewEvidence}
      />

      <aside className="gate-handoff" aria-labelledby="gate-2c-heading">
        <p className="eyebrow">Step 3</p>
        <h3 id="gate-2c-heading">Preview a policy change</h3>
        <p>
          Start from the exact published text. The immutable v1 snapshot remains unchanged while the candidate is edited and compared.
        </p>
        <button
          className="button primary"
          type="button"
          disabled={!candidateStartEnabled}
          onClick={onStartCandidate}
        >
          Start candidate v2
        </button>
        {!candidateStartEnabled ? (
          <p className="control-help">A candidate can start only once from the current published v1.</p>
        ) : null}
      </aside>
    </section>
  );
}
