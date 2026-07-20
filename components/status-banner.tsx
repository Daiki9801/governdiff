import type { AppError } from "../lib/errors/app-error";
import type { AnalysisMode } from "../lib/domain/types";
import type { DemoPhase } from "../lib/state/demo-state";

interface StatusBannerProps {
  readonly phase: DemoPhase;
  readonly mode: AnalysisMode;
  readonly reducerError: AppError | null;
  readonly commandError: AppError | null;
}

export function StatusBanner({
  phase,
  mode,
  reducerError,
  commandError,
}: StatusBannerProps) {
  const error = commandError ?? reducerError;
  if (error !== null) {
    return (
      <div className="status-banner error" role="alert">
        <strong>Action could not be completed</strong>
        <span>{error.message}</span>
      </div>
    );
  }

  if (
    phase === "draft_analyzing" ||
    phase === "baseline_analyzing" ||
    phase === "candidate_analyzing"
  ) {
    return (
      <div className="status-banner pending" aria-live="polite" aria-atomic="true">
        <span className="spinner" aria-hidden="true" />
        <span>{mode === "live" ? "Analyzing policy with Live GPT-5.6..." : "Loading precomputed policy analysis..."}</span>
      </div>
    );
  }

  return (
    <div className="status-banner neutral" aria-live="polite">
      <span>
        {mode === "live"
          ? "Live GPT-5.6 structures policy text. Runtime results are calculated locally from synthetic records."
          : "Sample Mode is network-free. Runtime results are calculated locally from synthetic records."}
      </span>
    </div>
  );
}
