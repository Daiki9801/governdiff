import type { DemoPhase } from "../lib/state/demo-state";

interface StepIndicatorProps {
  readonly phase: DemoPhase;
}

const STEPS = [
  { number: 1, label: "Policy", detail: "Draft and analyze" },
  { number: 2, label: "Review", detail: "Resolve and publish baseline" },
  { number: 3, label: "Impact & Publish", detail: "Compare, approve, and publish" },
] as const;

function activeStep(phase: DemoPhase): 1 | 2 | 3 {
  if (phase === "draft_editing" || phase === "draft_analyzing") {
    return 1;
  }
  if (phase.startsWith("candidate_") || phase === "impact_ready" || phase === "published") {
    return 3;
  }
  return 2;
}

export function StepIndicator({ phase }: StepIndicatorProps) {
  const current = activeStep(phase);
  return (
    <nav className="step-indicator" aria-label="Demo progress">
      <ol>
        {STEPS.map((step) => {
          const isCurrent = step.number === current;
          const isComplete = step.number < current;
          return (
            <li
              key={step.number}
              className={isCurrent ? "step is-current" : isComplete ? "step is-complete" : "step"}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span className="step-number" aria-hidden="true">
                {isComplete ? "✓" : step.number}
              </span>
              <span>
                <strong>{step.label}</strong>
                <small>{step.detail}</small>
              </span>
            </li>
          );
        })}
      </ol>
      <p className="phase-label">
        Current phase: <code>{phase}</code>
      </p>
    </nav>
  );
}
