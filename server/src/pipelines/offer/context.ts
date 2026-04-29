import { fetchOfferData, formatFetchedData } from "./actions.js";
import { PipelineContext } from "./pipeline.js";

export type OfferFetchData = Awaited<ReturnType<typeof fetchOfferData>>;
export type OfferFormatedData = Awaited<ReturnType<typeof formatFetchedData>>;

export type OfferPipelineContext = PipelineContext & {
    offerId: string;

    fetchedData?: OfferFetchData;
    formatedData?: OfferFormatedData;
}