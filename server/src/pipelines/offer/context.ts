import { PipelineContext } from "../pipeline.js";
import { fetchOfferData, formatFetchedData } from "./actions.js";

export type OfferFetchData = Awaited<ReturnType<typeof fetchOfferData>>;
export type OfferFormatedData = Awaited<ReturnType<typeof formatFetchedData>>;

export type OfferPipelineContext = PipelineContext & {
    offerId: string;

    fetchedData?: OfferFetchData;
    formatedData?: OfferFormatedData;

    docxBuffer: Buffer | null;
    pdfBuffer: Buffer | null;

    displayName?: string;
}