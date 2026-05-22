import { runPipeline } from "../pipeline.js";
import { OrderPipelineContext } from "./context.js";
import { orderStages } from "./stages.js";

type Result = {
    displayName: string;
}

export async function generateOrderDocument(orderId: string, taskId: string, documentId: string, version: number): Promise<Result> {
    const ctx: OrderPipelineContext = { orderId, taskId, documentId, version };
    const result = await runPipeline(ctx, orderStages);

    return { displayName: result.displayName! };
}