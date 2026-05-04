import path from "path";
import fs from 'fs/promises';

import env from "../../lib/env.js";
import { fetchOfferData, formatFetchedData, postprocessing, generating, converting } from "./actions.js";
import { OfferPipelineContext } from "./context.js";
import { Stage } from "./pipeline.js";
import { TaskStatus } from "@prisma/client";

const fetch: Stage<OfferPipelineContext> = {
    name: "fetch",
    status: TaskStatus.RUNNING,
    run: async (context) => {
        context.fetchedData = await fetchOfferData(context.offerId);
    }
}

const preprocess: Stage<OfferPipelineContext> = {
    name: "preprocess",
    run: async (context) => {
        context.formatedData = await formatFetchedData(context.fetchedData);
    }
}

const postprocess: Stage<OfferPipelineContext> = {
    name: 'postprocess',
    run: async (context) => {
        context.formatedData = await postprocessing(context.formatedData);
    }
}

const prepare: Stage<OfferPipelineContext> = {
    name: "prepare",
    run: async (ctx) => {
        ctx.outDir = path.join(env.OUTPUT_DIR, ctx.taskId);
        await fs.mkdir(ctx.outDir, { recursive: true });
    },
};

const generate: Stage<OfferPipelineContext> = {
    name: 'generate',
    run: async (context) => {
        context.docxBuffer = await generating(context.formatedData);
    }
}

const convert: Stage<OfferPipelineContext> = {
    name: 'convert',
    run: async (context) => {
        context.pdfBuffer = await converting(context.docxBuffer!);
    }
}

const write: Stage<OfferPipelineContext> = {
    name: 'write',
    run: async (context) => {
        context.docxPath = path.join(context.outDir!, "angebot.docx");
        context.pdfPath = path.join(context.outDir!, "angebot.pdf");

        await Promise.all([
            fs.writeFile(context.docxPath, context.docxBuffer!),
            fs.writeFile(context.pdfPath, context.pdfBuffer!),
        ]);
    }
}

export const offerStages: Stage<OfferPipelineContext>[] = [
    fetch,
    preprocess,
    postprocess,
    prepare,
    generate,
    convert,
    write,
]