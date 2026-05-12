import { TaskStatus } from "@prisma/client";
import { PipelineStage } from "../pipeline.js";
import { OrderPipelineContext } from "./context.js";

const loadOrderData: PipelineStage<OrderPipelineContext> = {
    name: "fetch",
    status: TaskStatus.RUNNING,
    run: async (context) => {
        console.log(context);
    }
}

const preprocess: PipelineStage<OrderPipelineContext> = {
    name: 'preprocess',
    run: async (context) => {

    }
}

export const orderStages: PipelineStage<OrderPipelineContext>[] = [
    loadOrderData
];