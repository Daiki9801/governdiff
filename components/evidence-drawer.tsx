"use client";

import { useEffect, useRef, type KeyboardEvent, type RefObject } from "react";

import type { Finding } from "../lib/domain/types";

export type FindingEvidenceContext =
  | "Published v1 before Impact"
  | "Published v1 · removed"
  | "Candidate v2 · added"
  | "Candidate v2 · unchanged";

interface EvidenceDrawerProps {
  readonly finding: Finding;
  readonly context: FindingEvidenceContext;
  readonly returnFocusRef: RefObject<HTMLButtonElement | null>;
  readonly fallbackFocusRef: RefObject<HTMLHeadingElement | null>;
  readonly onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function evidenceValue(value: string | boolean | null): string {
  if (value === null) {
    return "Not provided";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return value;
}

export function EvidenceDrawer({
  finding,
  context,
  returnFocusRef,
  fallbackFocusRef,
  onClose,
}: EvidenceDrawerProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, [finding.findingKey]);

  function requestClose(): void {
    onClose();
    window.requestAnimationFrame(() => {
      const returnFocus = returnFocusRef.current;
      if (returnFocus?.isConnected) {
        returnFocus.focus();
      } else {
        fallbackFocusRef.current?.focus();
      }
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>): void {
    if (event.key === "Escape") {
      event.preventDefault();
      requestClose();
      return;
    }
    if (event.key !== "Tab") {
      return;
    }
    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
    );
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusable[0]!;
    const last = focusable.at(-1)!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className="drawer-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          requestClose();
        }
      }}
    >
      <aside
        ref={dialogRef}
        className="evidence-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-heading"
        aria-describedby="evidence-scope"
        onKeyDown={handleKeyDown}
      >
        <div className="drawer-heading">
          <div>
            <p className="eyebrow">{context}</p>
            <h2 id="evidence-heading">Finding evidence</h2>
          </div>
          <button
            ref={closeButtonRef}
            className="drawer-close"
            type="button"
            onClick={requestClose}
          >
            Close
          </button>
        </div>

        <dl className="evidence-summary">
          <div><dt>Record</dt><dd><code>{finding.expenseId}</code></dd></div>
          <div><dt>Rule</dt><dd><code>{finding.ruleId}</code></dd></div>
          <div><dt>Outcome</dt><dd>{finding.outcome.replaceAll("_", " ")}</dd></div>
        </dl>

        <section aria-labelledby="source-sentence-heading">
          <h3 id="source-sentence-heading">Policy source sentence</h3>
          <blockquote>“{finding.sourceQuote}”</blockquote>
        </section>
        <section aria-labelledby="condition-heading">
          <h3 id="condition-heading">Expected condition</h3>
          <p>{finding.expectedCondition}</p>
        </section>
        <section aria-labelledby="observed-heading">
          <h3 id="observed-heading">Observed projected fields</h3>
          <dl className="observed-fields">
            {Object.entries(finding.observed).map(([field, value]) => (
              <div key={field}>
                <dt><code>{field}</code></dt>
                <dd>{evidenceValue(value ?? null)}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section aria-labelledby="reason-heading">
          <h3 id="reason-heading">Host-generated reason</h3>
          <p>{finding.message}</p>
        </section>

        <p id="evidence-scope" className="scope-note">
          This evidence explains a deterministic review Finding. It is not a fraud, compliance, approval, payment, or reimbursement determination.
        </p>
      </aside>
    </div>
  );
}
