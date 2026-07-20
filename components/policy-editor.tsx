import type { RefObject } from "react";

import type { DemoPhase } from "../lib/state/demo-state";

interface PolicyEditorProps {
  readonly idPrefix?: string;
  readonly eyebrow?: string;
  readonly heading?: string;
  readonly label?: string;
  readonly text: string;
  readonly phase: DemoPhase;
  readonly analyzeEnabled: boolean;
  readonly resetEnabled: boolean;
  readonly editable: boolean;
  readonly retrying: boolean;
  readonly analyzeLabel?: string;
  readonly quickActionLabel?: string;
  readonly quickActionEnabled?: boolean;
  readonly onTextChange: (text: string) => void;
  readonly onAnalyze: () => void;
  readonly onQuickAction?: () => void;
  readonly onReset: () => void;
  readonly headingRef?: RefObject<HTMLHeadingElement | null>;
}

export function PolicyEditor({
  idPrefix = "baseline",
  eyebrow = "Step 1",
  heading = "Policy document",
  label = "Mavrenna global expense policy",
  text,
  phase,
  analyzeEnabled,
  resetEnabled,
  editable,
  retrying,
  analyzeLabel = "Analyze policy",
  quickActionLabel,
  quickActionEnabled = false,
  onTextChange,
  onAnalyze,
  onQuickAction,
  onReset,
  headingRef,
}: PolicyEditorProps) {
  const analyzing =
    phase === "draft_analyzing" ||
    phase === "baseline_analyzing" ||
    phase === "candidate_analyzing";
  const headingId = `${idPrefix}-policy-heading`;
  const textareaId = `${idPrefix}-policy-text`;
  return (
    <section className="panel policy-panel" aria-labelledby={headingId}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={headingId} ref={headingRef} tabIndex={headingRef === undefined ? undefined : -1}>
            {heading}
          </h2>
        </div>
        <span className="phase-chip">{phase.replaceAll("_", " ")}</span>
      </div>

      <label className="field-label" htmlFor={textareaId}>
        {label}
      </label>
      <textarea
        id={textareaId}
        value={text}
        disabled={!editable || analyzing}
        rows={18}
        spellCheck={false}
        onChange={(event) => onTextChange(event.target.value)}
      />
      {!editable ? (
        <p className="control-help">This published policy is immutable in this demo session.</p>
      ) : analyzing ? (
        <p className="control-help">Editing is disabled while analysis is in progress.</p>
      ) : null}

      <div className="button-row">
        {quickActionLabel === undefined || onQuickAction === undefined ? null : (
          <button
            className="button secondary"
            type="button"
            disabled={!quickActionEnabled}
            onClick={onQuickAction}
          >
            {quickActionLabel}
          </button>
        )}
        <button className="button primary" type="button" disabled={!analyzeEnabled} onClick={onAnalyze}>
          {retrying ? "Retry analysis" : analyzeLabel}
        </button>
        <button className="button secondary" type="button" disabled={!resetEnabled} onClick={onReset}>
          Reset demo
        </button>
      </div>
      {!analyzeEnabled && !analyzing && editable ? (
        <p className="control-help">Analyze becomes available from an editable policy phase.</p>
      ) : null}
      {quickActionLabel !== undefined && !quickActionEnabled && editable && !analyzing ? (
        <p className="control-help">The canonical action requires the exact published v1 candidate text.</p>
      ) : null}
    </section>
  );
}
