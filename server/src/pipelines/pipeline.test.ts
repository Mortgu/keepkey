import { describe, expect, it, vi } from "vitest";

vi.mock("../middlewares/logger.js", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

import { PipelineStage, runPipeline } from "./pipeline.js";

describe("runPipeline", () => {
  it("führt Stages der Reihe nach mit demselben Context aus", async () => {
    const context = { values: [] as string[] };
    const receivedContexts: typeof context[] = [];
    const stages: PipelineStage<typeof context>[] = [
      {
        name: "first",
        run: async (ctx) => {
          receivedContexts.push(ctx);
          ctx.values.push("first");
        },
      },
      {
        name: "second",
        run: async (ctx) => {
          receivedContexts.push(ctx);
          ctx.values.push("second");
        },
      },
    ];

    const result = await runPipeline(context, stages);

    expect(result).toBe(context);
    expect(result.values).toEqual(["first", "second"]);
    expect(receivedContexts).toEqual([context, context]);
  });

  it("bricht beim ersten Fehler ab und reicht ihn unverändert weiter", async () => {
    const error = new Error("stage failed");
    const skippedStage = vi.fn(async () => {});
    const stages: PipelineStage<Record<string, never>>[] = [
      {
        name: "failing",
        run: async () => {
          throw error;
        },
      },
      {
        name: "skipped",
        run: skippedStage,
      },
    ];

    await expect(runPipeline({}, stages)).rejects.toBe(error);
    expect(skippedStage).not.toHaveBeenCalled();
  });
});
