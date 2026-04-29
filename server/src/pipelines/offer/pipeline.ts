import { prisma } from "../../lib/prisma.js";
import { OfferPipelineContext } from "./context.js";
import { offerStages } from "./stages.js";

export type PipelineContext = {
    documentJobId: string;
    docxBuffer?: Buffer;
    pdfBuffer?: Buffer;
    outDir?: string;
    docxPath?: string;
    pdfPath?: string;
};

export type Stage<T extends PipelineContext = PipelineContext> = {
    name: string;
    status?: string;
    run: (ctx: T) => Promise<void>;
};

export async function runPipeline<T extends PipelineContext>(ctx: T, stages: Stage<T>[]): Promise<T> {
    for (const stage of stages) {
        if (stage.status) {
            await prisma.documentJob.update({
                where: { id: ctx.documentJobId },
                data: { status: stage.status },
            });
        }
        console.log(`[pipeline] stage: ${stage.name}`);
        await stage.run(ctx);
    }
    return ctx;
}


export async function generateOfferDocument(offerId: string, documentJobId: string,): Promise<{ docxPath: string; pdfPath: string }> {
    const ctx: OfferPipelineContext = { offerId, documentJobId };
    const result = await runPipeline(ctx, offerStages);
    return { docxPath: result.docxPath!, pdfPath: result.pdfPath! };
}
