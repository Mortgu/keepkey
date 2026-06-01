import path from "path";
import fs from "fs/promises";

import env from "../../lib/env.js";
import {converting, fetchOfferData, formatFetchedData, generating, postprocessing,} from "./actions.js";
import {OfferPipelineContext} from "./context.js";
import {TaskStatus} from "@prisma/client";
import {PipelineStage, PipelineStageError} from "../pipeline.js";

const loadOfferData: PipelineStage<OfferPipelineContext> = {
    name: "fetch",
    status: TaskStatus.RUNNING,
    run: async (context) => {
        try {
            context.fetchedData = await fetchOfferData(context.offerId);
        } catch (exception: any) {
            throw new PipelineStageError("Failed to fetch offer data!", 500, exception.message)
        }
    },
};

const preprocess: PipelineStage<OfferPipelineContext> = {
    name: "preprocess",
    run: async (context) => {
        try {
            context.formatedData = await formatFetchedData(context.fetchedData);
        } catch (exception: any) {
            throw new PipelineStageError("Preprocess step in pipeline failed", 500, exception.message);
        }
    },
};

const postprocess: PipelineStage<OfferPipelineContext> = {
    name: "postprocess",
    run: async (context) => {
        try {
            context.formatedData = await postprocessing(context.formatedData);
        } catch (exception: any) {
            throw new PipelineStageError("Postprocess step in pipeline failed", 500, exception.message);
        }
    },
};

const prepare: PipelineStage<OfferPipelineContext> = {
    name: "prepare",
    run: async () => {
        await fs.mkdir(env.OUTPUT_DIR, {recursive: true});
    },
};

const generate: PipelineStage<OfferPipelineContext> = {
    name: "generate",
    run: async (context) => {
        context.docxBuffer = await generating(context.formatedData);
    },
};

const convert: PipelineStage<OfferPipelineContext> = {
    name: "convert",
    run: async (context) => {
        context.pdfBuffer = await converting(context.docxBuffer!);
    },
};

const write: PipelineStage<OfferPipelineContext> = {
    name: "write",
    run: async (context) => {
        const offer = context?.fetchedData?.offer;

        if (!offer) {
            throw new Error("Offer is null!");
        }

        const {quoteId, customer, offerPositions} = offer;
        const {companyName} = customer;

        const workloads = offerPositions
            .map((i) => i.product.name.replaceAll(" ", ""))
            .join("+");

        const baseName = `${quoteId}_AG_${companyName.replaceAll(" ", "").trim()}_Keepit-${workloads}`;
        context.displayName = `${baseName}_v${context.version}`;

        const docxPath = path.join(env.OUTPUT_DIR, `${context.documentId}.docx`);
        const pdfPath = path.join(env.OUTPUT_DIR, `${context.documentId}.pdf`);

        await Promise.all([
            fs.writeFile(docxPath, context.docxBuffer!),
            fs.writeFile(pdfPath, context.pdfBuffer!),
        ]);
    },
};

const upload: PipelineStage<OfferPipelineContext> = {
    name: 'upload',
    run: async (context) => {

    },
};

export const offerStages: PipelineStage<OfferPipelineContext>[] = [
    loadOfferData,
    preprocess,
    postprocess,
    prepare,
    generate,
    convert,
    write,
    upload,
];
