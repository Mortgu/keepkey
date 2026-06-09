import {TaskStatus} from "@prisma/client";
import {PipelineStage, PipelineStageError} from "../pipeline.js";
import {OrderPipelineContext} from "./context.js";
import {converting, fetchOrderData, formatOrderData, generating, postprocessing} from "./actions.js";
import {pickTranslation} from "../../utils/i18n.js";
import fs from "fs/promises";
import env from "../../lib/env.js";
import path from "path";

const loadOrderData: PipelineStage<OrderPipelineContext> = {
    name: "fetch",
    status: TaskStatus.RUNNING,
    run: async (context) => {
        context.fetchedData = await fetchOrderData(context.orderId);
    }
}

const preprocess: PipelineStage<OrderPipelineContext> = {
    name: 'preprocess',
    run: async (context) => {
        try {
            context.formatedData = await formatOrderData(context.fetchedData);
        } catch (exception: any) {
            throw new PipelineStageError("Preprocess step in pipeline failed!", 500, exception.message);
        }
    }
}


const postprocess: PipelineStage<OrderPipelineContext> = {
    name: "postprocess",
    run: async (context) => {
        try {
            context.formatedData = await postprocessing(context.formatedData);
        } catch (exception: any) {
            throw new PipelineStageError("Postprocess step in pipeline failed", 500, exception.message);
        }
    },
};


const prepare: PipelineStage<OrderPipelineContext> = {
    name: "prepare",
    run: async () => {
        await fs.mkdir(env.OUTPUT_DIR, {recursive: true});
    },
};

const generate: PipelineStage<OrderPipelineContext> = {
    name: "generate",
    run: async (context) => {
        context.docxBuffer = await generating(context.formatedData);
    },
};

const convert: PipelineStage<OrderPipelineContext> = {
    name: "convert",
    run: async (context) => {
        context.pdfBuffer = await converting(context.docxBuffer!);
    },
};


const write: PipelineStage<OrderPipelineContext> = {
    name: "write",
    run: async (context) => {
        const offer = context?.fetchedData?.order;

        if (!offer) {
            throw new Error("Offer is null!");
        }

        const {orderId, customer, orderPositions} = offer;
        const {companyName} = customer;

        const workloads = orderPositions
            .map((i) => (pickTranslation(i.product.translations, "DE")?.name ?? "").replaceAll(" ", ""))
            .join("+");

        const baseName = `${orderId}_BE_${companyName.replaceAll(" ", "").trim()}_Keepit-${workloads}`;
        context.displayName = `${baseName}_v${context.version}`;

        const docxPath = path.join(env.OUTPUT_DIR, `${context.documentId}.docx`);
        const pdfPath = path.join(env.OUTPUT_DIR, `${context.documentId}.pdf`);

        await Promise.all([
            fs.writeFile(docxPath, context.docxBuffer!),
            fs.writeFile(pdfPath, context.pdfBuffer!),
        ]);
    },
};


export const orderStages: PipelineStage<OrderPipelineContext>[] = [
    loadOrderData,
    preprocess,
    postprocess,
    prepare,
    generate,
    convert,
    write,
];