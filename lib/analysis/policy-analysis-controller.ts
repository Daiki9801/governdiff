import type {
  AnalyzePolicyRequest,
  AnalyzePolicyResult,
} from "./analyzer-contract";
import type { PolicyVersion } from "../domain/types";
import { createAppError, isAppError } from "../errors/app-error";
import type { DemoEvent } from "../state/demo-events";
import {
  canAnalyzeBaseline,
  canAnalyzeCandidate,
  type DemoState,
} from "../state/demo-state";

export type AnalysisTarget = "baseline" | "candidate";
export type AnalysisRequestSequence = number;
export type AnalysisRunOutcome = "started" | "superseded" | "rejected";

export type AnalyzeExecutor = (
  request: AnalyzePolicyRequest,
  signal: AbortSignal,
) => Promise<AnalyzePolicyResult>;

export interface PolicyAnalysisControllerDependencies {
  readonly getState: () => DemoState;
  readonly dispatch: (event: DemoEvent) => void;
  readonly execute: AnalyzeExecutor;
}

interface ActiveRequest {
  readonly sequence: AnalysisRequestSequence;
  readonly target: AnalysisTarget;
  readonly requestedRevision: number;
  readonly request: AnalyzePolicyRequest;
  readonly abortController: AbortController;
  consumed: boolean;
}

function requestedPolicy(state: DemoState, target: AnalysisTarget) {
  return target === "baseline" ? state.baseline : state.candidate;
}

function requestForState(
  state: DemoState,
  target: AnalysisTarget,
): AnalyzePolicyRequest | null {
  if (target === "baseline") {
    if (!canAnalyzeBaseline(state)) {
      return null;
    }
    const targetVersion: PolicyVersion =
      state.phase === "draft_editing" ? "draft-v1" : "1.0.0";
    return Object.freeze({
      policyText: state.baseline.text,
      targetVersion,
    });
  }

  if (!canAnalyzeCandidate(state) || state.candidate === null) {
    return null;
  }
  return Object.freeze({
    policyText: state.candidate.text,
    targetVersion: "1.1.0",
  });
}

export class PolicyAnalysisController {
  readonly #getState: () => DemoState;
  readonly #dispatch: (event: DemoEvent) => void;
  readonly #execute: AnalyzeExecutor;
  #latestSequence: AnalysisRequestSequence = 0;
  #active: ActiveRequest | null = null;

  constructor({
    getState,
    dispatch,
    execute,
  }: PolicyAnalysisControllerDependencies) {
    this.#getState = getState;
    this.#dispatch = dispatch;
    this.#execute = execute;
  }

  async analyze(target: AnalysisTarget): Promise<AnalysisRunOutcome> {
    const state = this.#getState();
    const policy = requestedPolicy(state, target);
    if (policy === null) {
      return "rejected";
    }

    const prior = this.#active;
    const supersedesPrior =
      prior !== null &&
      prior.target === target &&
      prior.requestedRevision === policy.revision;
    const request = supersedesPrior ? prior.request : requestForState(state, target);
    if (request === null) {
      return "rejected";
    }

    const outcome: AnalysisRunOutcome = supersedesPrior
      ? "superseded"
      : "started";
    const sequence = this.#latestSequence + 1;
    this.#latestSequence = sequence;
    prior?.abortController.abort();

    const abortController = new AbortController();
    const active: ActiveRequest = {
      sequence,
      target,
      requestedRevision: policy.revision,
      request,
      abortController,
      consumed: false,
    };
    this.#active = active;

    if (!supersedesPrior) {
      this.#dispatch({
        type: "ANALYSIS_STARTED",
        target,
        requestedRevision: policy.revision,
      });
    }

    try {
      const result = await this.#execute(request, abortController.signal);
      if (!this.#mayComplete(active)) {
        return outcome;
      }
      this.#consume(active);
      this.#dispatch({
        type: "ANALYSIS_SUCCEEDED",
        target,
        requestedRevision: active.requestedRevision,
        spec: result.spec,
        metadata: result.metadata,
      });
    } catch (error) {
      if (!this.#mayComplete(active)) {
        return outcome;
      }
      this.#consume(active);
      this.#dispatch({
        type: "ANALYSIS_FAILED",
        target,
        requestedRevision: active.requestedRevision,
        error: isAppError(error)
          ? error
          : createAppError(
              "UNKNOWN_ERROR",
              "Policy analysis could not be completed.",
              true,
              "ANALYSIS_EXECUTOR_FAILED",
            ),
      });
    }

    return outcome;
  }

  cancel(): void {
    this.#latestSequence += 1;
    this.#active?.abortController.abort();
    this.#active = null;
  }

  #mayComplete(active: ActiveRequest): boolean {
    return (
      !active.consumed &&
      this.#active === active &&
      active.sequence === this.#latestSequence &&
      !active.abortController.signal.aborted &&
      requestedPolicy(this.#getState(), active.target)?.revision ===
        active.requestedRevision
    );
  }

  #consume(active: ActiveRequest): void {
    active.consumed = true;
    if (this.#active === active) {
      this.#active = null;
    }
  }
}
