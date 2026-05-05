import { TaskStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { OfferPipelineContext } from "./context.js";
import { offerStages } from "./stages.js";

export type PipelineContext = {
  taskId: string;
  docxBuffer?: Buffer;
  pdfBuffer?: Buffer;
  outDir?: string;

  docxPath?: string;
  docxName?: string;

  pdfPath?: string;
  pdfName?: string;
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
  docxPath: string;
  docxName: string;
  pdfPath: string;
  pdfName: string;
};

export async function generateOfferDocument(
  offerId: string,
  taskId: string,
): Promise<Result> {
  const ctx: OfferPipelineContext = { offerId, taskId };
  const result = await runPipeline(ctx, offerStages);
  return {
    docxPath: result.docxPath!,
    docxName: result.docxName!,

    pdfPath: result.pdfPath!,
    pdfName: result.pdfName!,
  };
}
