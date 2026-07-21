import logger from '@/utils/logger.js';

export class PipelineStageError extends Error {
  constructor(message: string, public readonly status?: number, public readonly cause?: unknown) {
    super(`[PipelineStageError] ${message}`);
    super.cause = cause;
    super.name = "PipelineStageError";
  }
}

export interface PipelineContext {
  version: number;

  docxBuffer: Buffer | null;
  pdfBuffer: Buffer | null;

  displayName: string | null;
}

export type PipelineStage<T> = {
  name: string;
  run: (ctx: T) => Promise<void>;
};

export async function runPipeline<T>(ctx: T, stages: PipelineStage<T>[]): Promise<T> {
  for (const stage of stages) {
    logger.info('pipeline_stage', { stage: stage.name });

    try {
      logger.info('pipeline_running', { stage: stage.name });
      await stage.run(ctx);
    } catch (exception: any) {
      logger.error('pipeline_stage_failed', { stage: stage.name, error: (exception as Error).message });
      throw exception;
    }
  }

  return ctx;
}
