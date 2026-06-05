import {PipelineContext} from "../pipeline.js";
import {fetchOrderData, formatOrderData} from "./actions.js";

export type OrderFetchedData = Awaited<ReturnType<typeof fetchOrderData>>;
export type OrderFormattedData = Awaited<ReturnType<typeof formatOrderData>>;

export type OrderPipelineContext = PipelineContext & {
    orderId: string;

    fetchedData?: OrderFetchedData;
    formatedData?: OrderFormattedData;
}