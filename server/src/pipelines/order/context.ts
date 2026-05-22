import { PipelineContext } from "../pipeline.js";

export type OrderPipelineContext = PipelineContext & {
    orderId: string;
}