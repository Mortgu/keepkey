import {runPipeline} from "../pipeline.js";
import {OrderPipelineContext} from "./context.js";
import {orderStages} from "./stages.js";

export default async function runOrderPipeline(context: OrderPipelineContext) {
    return await runPipeline(context, orderStages);
}