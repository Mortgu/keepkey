import { TaskStatus } from "@prisma/client";
import logger from "../middlewares/logger.js";
import { prisma } from "../lib/prismaClient.js";

export class PipelineStageError extends Error {
  constructor(message: string, public readonly status?: number, public readonly cause?: unknown) {
    super(`[PipelineStageError] ${message}`);
    super.cause = cause;
    super.name = "PiplineStageError";

    logger.error(message, cause);
  }
}

export interface PipelineContext {
  taskId: string;
  documentId: string;
  version: number;

  docxBuffer?: Buffer | null;
  pdfBuffer?: Buffer | null;

  displayName?: string;
}

export type PipelineStage<T extends PipelineContext = PipelineContext> = {
  name: string;
  status?: TaskStatus;
  run: (ctx: T) => Promise<void>;
};

export async function runPipeline<T extends PipelineContext>(ctx: T, stages: PipelineStage<T>[]): Promise<T> {
  for (const stage of stages) {
    if (stage.status) {
      await prisma.task.update({
        where: { id: ctx.taskId },
        data: { status: stage.status }
      });
    }

    logger.info(`[pipeline] stage: ${stage.name}`);

    try {
      console.log("[pipeline] running: " + stage.name);
      await stage.run(ctx);
    } catch (exception: any) {
      if (exception instanceof PipelineStageError) {
        logger.error(exception);
      }
    }
  }

  return ctx;
}
