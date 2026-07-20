import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import type { AnalyzePolicyResult } from "../../lib/analysis/analyzer-contract";
import {
  PolicyAnalysisController,
  type AnalyzeExecutor,
} from "../../lib/analysis/policy-analysis-controller";
import type { AnalysisMetadata } from "../../lib/domain/types";
import { loadDemoScenario } from "../../lib/demo/fixture-loader.server";
import { createAppError } from "../../lib/errors/app-error";
import type { DemoEvent } from "../../lib/state/demo-events";
import { demoReducer } from "../../lib/state/demo-reducer";
import {
  createInitialDemoState,
  type DemoState,
} from "../../lib/state/demo-state";

const METADATA: AnalysisMetadata = Object.freeze({
  mode: "sample",
  model: null,
  requestId: null,
  analyzedAt: "2026-07-19T00:00:00.000Z",
  durationMs: 1,
});

interface Deferred<T> {
  readonly promise: Promise<T>;
  readonly resolve: (value: T) => void;
  readonly reject: (reason: unknown) => void;
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function harness(execute: AnalyzeExecutor) {
  const scenario = loadDemoScenario(process.cwd(), false);
  let state = createInitialDemoState({
    initialDraftText: scenario.initialDraftText,
    liveModeAvailable: false,
  });
  const events: DemoEvent[] = [];
  const controller = new PolicyAnalysisController({
    getState: () => state,
    dispatch: (event) => {
      events.push(event);
      state = demoReducer(state, event);
    },
    execute,
  });
  return {
    controller,
    events,
    scenario,
    getState: () => state,
    setState: (next: DemoState) => {
      state = next;
    },
  };
}

function draftResult(
  scenario: ReturnType<typeof loadDemoScenario>,
): AnalyzePolicyResult {
  return Object.freeze({
    spec: scenario.sampleAnalyses["draft-v1"].analysis,
    metadata: METADATA,
  });
}

function candidateResult(
  scenario: ReturnType<typeof loadDemoScenario>,
): AnalyzePolicyResult {
  return Object.freeze({
    spec: scenario.sampleAnalyses["candidate-v2"].analysis,
    metadata: METADATA,
  });
}

function candidateEditingState(
  state: DemoState,
  policyText: string,
  revision = 1,
): DemoState {
  return {
    ...state,
    phase: "candidate_editing",
    candidate: {
      text: policyText,
      revision,
      analysis: null,
      analysisRevision: null,
      analysisId: null,
      analysisMetadata: null,
      approvalRevision: null,
      approvedAnalysisId: null,
    },
  };
}

describe("PolicyAnalysisController", () => {
  it("dispatches the exact start and current success events", async () => {
    const scenario = loadDemoScenario(process.cwd(), false);
    const h = harness(async () => draftResult(scenario));

    await expect(h.controller.analyze("baseline")).resolves.toBe("started");
    expect(h.events.map((event) => event.type)).toEqual([
      "ANALYSIS_STARTED",
      "ANALYSIS_SUCCEEDED",
    ]);
    expect(h.events[0]).toEqual({
      type: "ANALYSIS_STARTED",
      target: "baseline",
      requestedRevision: 0,
    });
    expect(h.events[1]).toEqual({
      type: "ANALYSIS_SUCCEEDED",
      target: "baseline",
      requestedRevision: 0,
      spec: scenario.sampleAnalyses["draft-v1"].analysis,
      metadata: METADATA,
    });
  });

  it("dispatches a current AppError unchanged", async () => {
    const failure = createAppError(
      "ANALYSIS_UPSTREAM_ERROR",
      "Retry policy analysis.",
      true,
      "TEST_UPSTREAM",
    );
    const h = harness(async () => Promise.reject(failure));

    await h.controller.analyze("baseline");
    expect(h.events[1]).toEqual({
      type: "ANALYSIS_FAILED",
      target: "baseline",
      requestedRevision: 0,
      error: failure,
    });
  });

  it("maps unknown failures to a safe AppError", async () => {
    const h = harness(async () => Promise.reject(new Error("sensitive")));

    await h.controller.analyze("baseline");
    const failure = h.events[1];
    expect(failure?.type).toBe("ANALYSIS_FAILED");
    if (failure?.type === "ANALYSIS_FAILED") {
      expect(failure.error).toEqual(
        expect.objectContaining({
          code: "UNKNOWN_ERROR",
          message: "Policy analysis could not be completed.",
        }),
      );
      expect(JSON.stringify(failure.error)).not.toContain("sensitive");
    }
  });

  it("lets only the latest same-revision request dispatch", async () => {
    const first = deferred<AnalyzePolicyResult>();
    const second = deferred<AnalyzePolicyResult>();
    const signals: AbortSignal[] = [];
    let call = 0;
    const h = harness((_request, signal) => {
      signals.push(signal);
      call += 1;
      return call === 1 ? first.promise : second.promise;
    });

    const firstRun = h.controller.analyze("baseline");
    const secondRun = h.controller.analyze("baseline");
    expect(signals[0]?.aborted).toBe(true);
    expect(signals[1]?.aborted).toBe(false);
    expect(h.events.map((event) => event.type)).toEqual(["ANALYSIS_STARTED"]);

    first.resolve(draftResult(h.scenario));
    await expect(firstRun).resolves.toBe("started");
    expect(h.events.map((event) => event.type)).toEqual(["ANALYSIS_STARTED"]);

    second.resolve(draftResult(h.scenario));
    await expect(secondRun).resolves.toBe("superseded");
    expect(h.events.map((event) => event.type)).toEqual([
      "ANALYSIS_STARTED",
      "ANALYSIS_SUCCEEDED",
    ]);
  });

  it("silently discards superseded failures", async () => {
    const first = deferred<AnalyzePolicyResult>();
    const second = deferred<AnalyzePolicyResult>();
    let call = 0;
    const h = harness(() => {
      call += 1;
      return call === 1 ? first.promise : second.promise;
    });

    const firstRun = h.controller.analyze("baseline");
    const secondRun = h.controller.analyze("baseline");
    first.reject(new Error("old failure"));
    await firstRun;
    expect(h.events.map((event) => event.type)).toEqual(["ANALYSIS_STARTED"]);
    second.resolve(draftResult(h.scenario));
    await secondRun;
    expect(h.events.at(-1)?.type).toBe("ANALYSIS_SUCCEEDED");
  });

  it.each(["success", "failure"] as const)(
    "silently discards a stale-revision %s",
    async (completion) => {
      const pending = deferred<AnalyzePolicyResult>();
      const h = harness(() => pending.promise);
      const run = h.controller.analyze("baseline");
      const analyzing = h.getState();
      h.setState({
        ...analyzing,
        baseline: {
          ...analyzing.baseline,
          revision: analyzing.baseline.revision + 1,
        },
      });

      if (completion === "success") {
        pending.resolve(draftResult(h.scenario));
      } else {
        pending.reject(new Error("stale"));
      }
      await run;
      expect(h.events.map((event) => event.type)).toEqual(["ANALYSIS_STARTED"]);
    },
  );

  it("cancels idempotently and remains reusable", async () => {
    const first = deferred<AnalyzePolicyResult>();
    const signals: AbortSignal[] = [];
    let useDeferred = true;
    const h = harness((_request, signal) => {
      signals.push(signal);
      if (useDeferred) {
        return first.promise;
      }
      return Promise.resolve(draftResult(h.scenario));
    });

    const run = h.controller.analyze("baseline");
    h.controller.cancel();
    h.controller.cancel();
    expect(signals[0]?.aborted).toBe(true);
    first.resolve(draftResult(h.scenario));
    await run;
    expect(h.events.map((event) => event.type)).toEqual(["ANALYSIS_STARTED"]);

    h.setState(
      createInitialDemoState({
        initialDraftText: h.scenario.initialDraftText,
        liveModeAvailable: false,
      }),
    );
    useDeferred = false;
    await h.controller.analyze("baseline");
    expect(h.events.at(-1)?.type).toBe("ANALYSIS_SUCCEEDED");
  });

  it("ignores duplicate promise settlement", async () => {
    const pending = deferred<AnalyzePolicyResult>();
    const h = harness(() => pending.promise);
    const run = h.controller.analyze("baseline");
    const result = draftResult(h.scenario);
    pending.resolve(result);
    pending.resolve(result);
    await run;
    expect(
      h.events.filter((event) => event.type === "ANALYSIS_SUCCEEDED"),
    ).toHaveLength(1);
  });

  it("rejects ineligible requests without executor or event", async () => {
    let calls = 0;
    const h = harness(async () => {
      calls += 1;
      return draftResult(h.scenario);
    });
    h.setState({ ...h.getState(), phase: "draft_blocked" });

    await expect(h.controller.analyze("baseline")).resolves.toBe("rejected");
    await expect(h.controller.analyze("candidate")).resolves.toBe("rejected");
    expect(calls).toBe(0);
    expect(h.events).toEqual([]);
  });

  it("maps a future eligible candidate request to version 1.1.0", async () => {
    const requests: string[] = [];
    const h = harness(async (request) => {
      requests.push(request.targetVersion);
      return Object.freeze({
        spec: h.scenario.sampleAnalyses["candidate-v2"].analysis,
        metadata: METADATA,
      });
    });
    h.setState({
      ...h.getState(),
      phase: "candidate_editing",
      candidate: {
        text: h.scenario.policyV2,
        revision: 0,
        analysis: null,
        analysisRevision: null,
        analysisId: null,
        analysisMetadata: null,
        approvalRevision: null,
        approvedAnalysisId: null,
      },
    });

    await h.controller.analyze("candidate");
    expect(requests).toEqual(["1.1.0"]);
    expect(h.getState().phase).toBe("candidate_ready");
  });

  it("lets only the latest same-revision candidate request dispatch", async () => {
    const first = deferred<AnalyzePolicyResult>();
    const second = deferred<AnalyzePolicyResult>();
    const signals: AbortSignal[] = [];
    const requests: string[] = [];
    let call = 0;
    const h = harness((request, signal) => {
      requests.push(request.targetVersion);
      signals.push(signal);
      call += 1;
      return call === 1 ? first.promise : second.promise;
    });
    h.setState(candidateEditingState(h.getState(), h.scenario.policyV2));

    const firstRun = h.controller.analyze("candidate");
    const secondRun = h.controller.analyze("candidate");
    expect(requests).toEqual(["1.1.0", "1.1.0"]);
    expect(signals[0]?.aborted).toBe(true);
    expect(signals[1]?.aborted).toBe(false);
    expect(h.events).toEqual([
      {
        type: "ANALYSIS_STARTED",
        target: "candidate",
        requestedRevision: 1,
      },
    ]);

    first.resolve(candidateResult(h.scenario));
    await expect(firstRun).resolves.toBe("started");
    expect(h.events).toHaveLength(1);

    second.resolve(candidateResult(h.scenario));
    await expect(secondRun).resolves.toBe("superseded");
    expect(h.events.at(-1)).toEqual({
      type: "ANALYSIS_SUCCEEDED",
      target: "candidate",
      requestedRevision: 1,
      spec: h.scenario.sampleAnalyses["candidate-v2"].analysis,
      metadata: METADATA,
    });
    expect(h.getState().phase).toBe("candidate_ready");
  });

  it.each(["success", "failure"] as const)(
    "silently discards a stale candidate-revision %s",
    async (completion) => {
      const pending = deferred<AnalyzePolicyResult>();
      const h = harness(() => pending.promise);
      h.setState(candidateEditingState(h.getState(), h.scenario.policyV2));
      const run = h.controller.analyze("candidate");
      const analyzing = h.getState();
      h.setState({
        ...analyzing,
        candidate: {
          ...analyzing.candidate!,
          revision: analyzing.candidate!.revision + 1,
        },
      });

      if (completion === "success") {
        pending.resolve(candidateResult(h.scenario));
      } else {
        pending.reject(new Error("stale candidate failure"));
      }
      await run;
      expect(h.events.map((event) => event.type)).toEqual(["ANALYSIS_STARTED"]);
    },
  );

  it("separates baseline and candidate requests while remaining cancel-safe", async () => {
    const baseline = deferred<AnalyzePolicyResult>();
    const candidate = deferred<AnalyzePolicyResult>();
    const signals: AbortSignal[] = [];
    let call = 0;
    const h = harness((_request, signal) => {
      signals.push(signal);
      call += 1;
      return call === 1 ? baseline.promise : candidate.promise;
    });

    const baselineRun = h.controller.analyze("baseline");
    h.setState(candidateEditingState(h.getState(), h.scenario.policyV2));
    const candidateRun = h.controller.analyze("candidate");
    expect(signals[0]?.aborted).toBe(true);
    expect(signals[1]?.aborted).toBe(false);

    baseline.resolve(draftResult(h.scenario));
    await baselineRun;
    expect(
      h.events.filter((event) => event.type === "ANALYSIS_SUCCEEDED"),
    ).toHaveLength(0);

    candidate.resolve(candidateResult(h.scenario));
    await candidateRun;
    expect(h.events.at(-1)?.type).toBe("ANALYSIS_SUCCEEDED");
    expect(h.getState().phase).toBe("candidate_ready");

    h.controller.cancel();
    h.controller.cancel();
    h.setState(candidateEditingState(h.getState(), h.scenario.policyV2, 2));
    const duplicate = deferred<AnalyzePolicyResult>();
    const reused = harness(() => duplicate.promise);
    reused.setState(
      candidateEditingState(reused.getState(), reused.scenario.policyV2, 2),
    );
    const run = reused.controller.analyze("candidate");
    const result = candidateResult(reused.scenario);
    duplicate.resolve(result);
    duplicate.resolve(result);
    await run;
    expect(
      reused.events.filter((event) => event.type === "ANALYSIS_SUCCEEDED"),
    ).toHaveLength(1);
  });

  it("has no React, Next, Node, OpenAI, or network import", () => {
    const source = readFileSync(
      join(process.cwd(), "lib", "analysis", "policy-analysis-controller.ts"),
      "utf8",
    );
    expect(source).not.toMatch(
      /from\s+["'](?:react|next|node:|openai)|fetch\s*\(|XMLHttpRequest|WebSocket/,
    );
  });
});
