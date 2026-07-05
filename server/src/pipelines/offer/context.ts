import type { OfferContext } from "../../schemas/templates/offer-template-schema.js";
import { PipelineContext } from "../pipeline.js";
import { fetchOfferData } from "./actions.js";

export type OfferFetchData = Awaited<ReturnType<typeof fetchOfferData>>;

export type OfferPipelineContext = PipelineContext & {
  offerId: string;

  fetchedData?: OfferFetchData;
  formatedData?: OfferContext;
}
