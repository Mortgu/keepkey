import {PipelineStage, PipelineStageError} from "../pipeline.js";
import {OrderPipelineContext} from "./context.js";
import {converting, fetchOrderData, formatOrderData, generating, postprocessing} from "./actions.js";
import {pickTranslation} from "../../utils/i18n.js";

const loadOrderData: PipelineStage<OrderPipelineContext> = {
    name: "fetch",
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


const metadata: PipelineStage<OrderPipelineContext> = {
    name: "metadata",
    run: async (context) => {
        const order = context.fetchedData?.order;

        if (!order) {
            throw new PipelineStageError("Failed to create document display name: order data is empty.");
        }

        const {orderId, customer, orderPositions} = order;
        const {companyName} = customer;

        const workloads = orderPositions
            .map((i) => (pickTranslation(i.product.translations, "DE")?.name ?? "").replaceAll(" ", ""))
            .join("+");

        const baseName = `${orderId}_BE_${companyName.replaceAll(" ", "").trim()}_Keepit-${workloads}`;
        context.displayName = `${baseName}_v${context.version}`;
    },
};


export const orderStages: PipelineStage<OrderPipelineContext>[] = [
    loadOrderData,
    preprocess,
    postprocess,
    generate,
    convert,
    metadata,
];
