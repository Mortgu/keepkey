import {runPipeline} from "../pipeline.js";
import {orderStages} from "./stages.js";
import {OrderPipelineContext} from "./context.js";

export default async function runOrderPipeline(context: OrderPipelineContext) {
    return await runPipeline(context, orderStages);
}