import type { RefObject } from "react";

import type { Finding } from "../lib/domain/types";
import type { ImpactComputation } from "../lib/state/demo-state";
import { FindingTable } from "./finding-table";

interface ImpactPreviewProps {
  readonly computation: ImpactComputation;
  readonly approved: boolean;
  readonly published: boolean;
  readonly approveEnabled: boolean;
  readonly publishEnabled: boolean;
  readonly onApprove: () => void;
  readonly onPublish: () => void;
  readonly onViewEvidence: (
    finding: Finding,
    trigger: HTMLButtonElement,
  ) => void;
  readonly headingRef?: RefObject<HTMLHeadingElement | null>;
}

export function ImpactPreview({
  computation,
  approved,
  published,
  approveEnabled,
  publishEnabled,
  onApprove,
  onPublish,
  onViewEvidence,
  headingRef,
}: ImpactPreviewProps) {
  const { preview } = computation;
  return (
    <section className="panel impact-panel" aria-labelledby="impact-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Step 3 · Deterministic comparison</p>
          <h2 id="impact-heading" ref={headingRef} tabIndex={-1}>
            Impact Preview
          </h2>
        </div>
        <span className={approved ? "published-chip" : "count-chip"}>
          {published ? "Published" : approved ? "Approved" : "Approval required"}
        </span>
      </div>

      <div className="impact-total" aria-label="Finding count change">
        <strong>{preview.baselineCount}</strong>
        <span aria-hidden="true">→</span>
        <strong>{preview.candidateCount}</strong>
        <span>review Findings</span>
      </div>
      <div className="impact-metrics" aria-label="FindingKey classification">
        <div><strong>{preview.removed.length}</strong><span>removed</span></div>
        <div><strong>{preview.added.length}</strong><span>added</span></div>
        <div><strong>{preview.unchanged.length}</strong><span>unchanged</span></div>
      </div>
      <p className="scope-note">
        Classification compares exact FindingKey sets. “Unchanged” means the same key exists under both versions; there is no modified-Finding category.
      </p>

      <section className="impact-section" aria-labelledby="rule-diff-heading">
        <div className="section-title-row">
          <h3 id="rule-diff-heading">Rule Diff</h3>
          <span>{preview.ruleDiff.length}</span>
        </div>
        <ul className="rule-diff-list">
          {preview.ruleDiff.map((entry) => (
            <li key={entry.ruleId}>
              <div className="rule-title-row">
                <code>{entry.ruleId}</code>
                <strong>{entry.kind}</strong>
              </div>
              {entry.before === null ? null : (
                <p><span>Before</span> “{entry.before.sourceQuote}”</p>
              )}
              {entry.after === null ? null : (
                <p><span>After</span> “{entry.after.sourceQuote}”</p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="impact-section" aria-labelledby="affected-heading">
        <div className="section-title-row">
          <h3 id="affected-heading">Affected records</h3>
          <span>{preview.removed.length + preview.added.length}</span>
        </div>
        <FindingTable
          findings={preview.removed}
          caption="Removed under candidate v2 · published-v1 evidence"
          regionLabel="Removed review findings"
          onViewEvidence={onViewEvidence}
        />
        <FindingTable
          findings={preview.added}
          caption="Added under candidate v2 · candidate evidence"
          regionLabel="Added review findings"
          onViewEvidence={onViewEvidence}
        />
        <details className="unchanged-findings">
          <summary>Review {preview.unchanged.length} unchanged Findings</summary>
          <FindingTable
            findings={preview.unchanged}
            caption="Same FindingKey under both versions · candidate-side evidence"
            regionLabel="Unchanged review findings"
            onViewEvidence={onViewEvidence}
          />
        </details>
      </section>

      <section className="approval-panel" aria-labelledby="approval-heading">
        <h3 id="approval-heading">Candidate approval</h3>
        <p>
          {published
            ? "Candidate v2 was published from its current approved analysis and Impact."
            : approved
              ? "Approval is bound to the current candidate revision and analysis."
              : "New approval is required for candidate v2 after reviewing the current Impact."}
        </p>
        <div className="button-row">
          <button
            className="button secondary"
            type="button"
            disabled={!approveEnabled}
            onClick={onApprove}
          >
            Approve candidate
          </button>
          <button
            className="button primary"
            type="button"
            disabled={!publishEnabled}
            onClick={onPublish}
          >
            Publish candidate v2
          </button>
        </div>
        {!approved && !published ? (
          <p className="control-help">Publish remains disabled until the current candidate is approved.</p>
        ) : null}
      </section>
    </section>
  );
}
