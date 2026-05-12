import { TaskStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export interface PipelineContext {
    taskId: string;
    documentId: string;
    version: number;

    docxBuffer?: Buffer;
    pdfBuffer?: Buffer;

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

        console.log(`[pipeline] stage: ${stage.name}`);
        await stage.run(ctx);
    }

    return ctx;
}