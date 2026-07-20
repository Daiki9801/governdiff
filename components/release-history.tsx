import type { RefObject } from "react";

import type { ReleaseSnapshot } from "../lib/state/demo-state";

interface ReleaseHistoryProps {
  readonly releases: readonly ReleaseSnapshot[];
  readonly headingRef?: RefObject<HTMLHeadingElement | null>;
}

export function ReleaseHistory({ releases, headingRef }: ReleaseHistoryProps) {
  return (
    <section className="panel release-history" aria-labelledby="release-history-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Session-only history</p>
          <h2 id="release-history-heading" ref={headingRef} tabIndex={-1}>
            Release history
          </h2>
        </div>
        <span className="count-chip">{releases.length} published</span>
      </div>
      <ol className="release-list">
        {releases.map((release) => (
          <li key={release.releaseId}>
            <div>
              <strong>{release.displayVersion}</strong>
              <code>{release.releaseId}</code>
            </div>
            <dl>
              <div><dt>Release</dt><dd>{release.releaseVersion}</dd></div>
              <div><dt>Findings</dt><dd>{release.findings.length}</dd></div>
              <div><dt>Status</dt><dd>{release.status}</dd></div>
            </dl>
          </li>
        ))}
      </ol>
      <p className="scope-note">
        Published snapshots are immutable for this local session. GovernDiff provides no rollback, revoke, or operational expense action.
      </p>
    </section>
  );
}
