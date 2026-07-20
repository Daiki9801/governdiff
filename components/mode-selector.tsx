import type { AnalysisMode } from "../lib/domain/types";

interface ModeSelectorProps {
  readonly mode: AnalysisMode;
  readonly liveModeAvailable: boolean;
  readonly disabled: boolean;
  readonly onModeChange: (mode: AnalysisMode) => void;
}

export function ModeSelector({
  mode,
  liveModeAvailable,
  disabled,
  onModeChange,
}: ModeSelectorProps) {
  return (
    <fieldset className="mode-selector" disabled={disabled}>
      <legend>Analysis mode</legend>
      <label>
        <input
          type="radio"
          name="analysis-mode"
          value="sample"
          checked={mode === "sample"}
          onChange={() => onModeChange("sample")}
        />
        <span>
          <strong>Sample Mode</strong>
          <small>Precomputed policy analysis</small>
        </span>
      </label>
      <label className="is-disabled">
        <input
          type="radio"
          name="analysis-mode"
          value="live"
          checked={mode === "live"}
          disabled={!liveModeAvailable || disabled}
          onChange={() => onModeChange("live")}
        />
        <span>
          <strong>Live GPT-5.6</strong>
          <small>
            {liveModeAvailable ? "Available" : "Requires OPENAI_API_KEY"}
          </small>
        </span>
      </label>
    </fieldset>
  );
}
