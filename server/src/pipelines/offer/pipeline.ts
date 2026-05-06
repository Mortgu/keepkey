import { TaskStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { OfferPipelineContext } from "./context.js";
import { offerStages } from "./stages.js";

export type PipelineContext = {
  taskId: string;
  documentId: string;
  version: number;

  docxBuffer?: Buffer;
  pdfBuffer?: Buffer;

  displayName?: string;
};

export type Stage<T extends PipelineContext = PipelineContext> = {
  name: string;
  status?: TaskStatus;
  run: (ctx: T) => Promise<void>;
};

export async function runPipeline<T extends PipelineContext>(
  ctx: T,
  stages: Stage<T>[],
): Promise<T> {
  for (const stage of stages) {
    if (stage.status) {
      await prisma.task.update({
        where: { id: ctx.taskId },
        data: { status: stage.status },
      });
    }
    console.log(`[pipeline] stage: ${stage.name}`);
    await stage.run(ctx);
  }
  return ctx;
}

type Result = {
  displayName: string;
};

export async function generateOfferDocument(offerId: string, taskId: string, documentId: string, version: number): Promise<Result> {
  const ctx: OfferPipelineContext = { offerId, taskId, documentId, version };
  const result = await runPipeline(ctx, offerStages);

  return {
    displayName: result.displayName!,
  };
}
