import type { RefObject } from "react";

import type { RevisionedPolicy, DemoPhase } from "../lib/state/demo-state";
import { RuleList } from "./rule-list";

interface AnalysisPanelProps {
  readonly idPrefix?: string;
  readonly eyebrow?: string;
  readonly heading?: string;
  readonly policy: RevisionedPolicy;
  readonly phase: DemoPhase;
  readonly resolveEnabled: boolean;
  readonly baselineReleaseEnabled: boolean;
  readonly impactEnabled?: boolean;
  readonly retryEnabled: boolean;
  readonly onResolve: () => void;
  readonly onRetry: () => void;
  readonly onCreateBaselineRelease: () => void;
  readonly onComputeImpact?: () => void;
  readonly headingRef?: RefObject<HTMLHeadingElement | null>;
}

export function AnalysisPanel({
  idPrefix = "baseline",
  eyebrow = "Step 2",
  heading = "Review structured policy",
  policy,
  phase,
  resolveEnabled,
  baselineReleaseEnabled,
  impactEnabled = false,
  retryEnabled,
  onResolve,
  onRetry,
  onCreateBaselineRelease,
  onComputeImpact,
  headingRef,
}: AnalysisPanelProps) {
  const analysis = policy.analysis;
  const reviewHeadingId = `${idPrefix}-review-heading`;
  const rulesHeadingId = `${idPrefix}-rules-heading`;
  const ambiguitiesHeadingId = `${idPrefix}-ambiguities-heading`;
  const unsupportedHeadingId = `${idPrefix}-unsupported-heading`;
  return (
    <section className="panel analysis-panel" aria-labelledby={reviewHeadingId}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={reviewHeadingId} ref={headingRef} tabIndex={-1}>
            {heading}
          </h2>
        </div>
        <span className="count-chip">{analysis?.rules.length ?? 0} rules</span>
      </div>

      {analysis === null ? (
        <div className="empty-state review-empty">
          <p>Analyze the current policy to review measurable rules and blocking issues.</p>
          {retryEnabled ? (
            <button className="button secondary" type="button" onClick={onRetry}>
              Retry analysis
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <section className="review-section" aria-labelledby={rulesHeadingId}>
            <div className="section-title-row">
              <h3 id={rulesHeadingId}>Measurable rules</h3>
              <span>{analysis.rules.length}</span>
            </div>
            <RuleList rules={analysis.rules} />
          </section>

          <section className="review-section" aria-labelledby={ambiguitiesHeadingId}>
            <div className="section-title-row">
              <h3 id={ambiguitiesHeadingId}>Ambiguities</h3>
              <span>{analysis.ambiguities.length}</span>
            </div>
            {analysis.ambiguities.length === 0 ? (
              <p className="success-note">No blocking ambiguity remains.</p>
            ) : (
              <ul className="issue-list">
                {analysis.ambiguities.map((ambiguity) => (
                  <li key={ambiguity.id} className="blocking-issue">
                    <strong>{ambiguity.blocking ? "Publication blocked" : "Clarification"}</strong>
                    <blockquote>“{ambiguity.sourceQuote}”</blockquote>
                    <p>{ambiguity.question}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="review-section" aria-labelledby={unsupportedHeadingId}>
            <div className="section-title-row">
              <h3 id={unsupportedHeadingId}>Unsupported statements</h3>
              <span>{analysis.unsupportedStatements.length}</span>
            </div>
            {analysis.unsupportedStatements.length === 0 ? (
              <p className="success-note">No unsupported statement blocks this version.</p>
            ) : (
              <ul className="issue-list">
                {analysis.unsupportedStatements.map((statement) => (
                  <li key={`${statement.sourceQuote}-${statement.reason}`}>
                    <blockquote>“{statement.sourceQuote}”</blockquote>
                    <p>{statement.reason}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <div className="button-row review-actions">
        {phase === "draft_blocked" ? (
          <button className="button primary" type="button" disabled={!resolveEnabled} onClick={onResolve}>
            Resolve to USD 275.00
          </button>
        ) : null}
        {phase === "baseline_ready" ? (
          <button
            className="button primary"
            type="button"
            disabled={!baselineReleaseEnabled}
            onClick={onCreateBaselineRelease}
          >
            Approve baseline &amp; run
          </button>
        ) : null}
        {phase === "candidate_ready" && onComputeImpact !== undefined ? (
          <button
            className="button primary"
            type="button"
            disabled={!impactEnabled}
            onClick={onComputeImpact}
          >
            Compute Impact
          </button>
        ) : null}
      </div>
    </section>
  );
}
