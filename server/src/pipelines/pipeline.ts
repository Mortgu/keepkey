import { TaskStatus } from "@prisma/client";
import { prisma } from "../lib/prismaClient.js";
import logger from "../middlewares/logger.js";

export class PipelineStageError extends Error {
  constructor(message: string, public readonly status?: number, public readonly cause?: unknown) {
    super(`[PipelineStageError] ${message}`);
    super.cause = cause;
    super.name = "PipelineStageError";
  }
}

export interface PipelineContext {
  taskId: string;
  documentId: string;
  version: number;

  docxBuffer: Buffer | null;
  pdfBuffer: Buffer | null;

  displayName: string | null;

  /** Filesystem path of the generated document that should be persisted/served. */
  path?: string;
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
      logger.info("[pipeline] running: " + stage.name);
      await stage.run(ctx);
    } catch (exception: any) {
      logger.error(exception);
      throw exception;
    }
  }

  return ctx;
}
