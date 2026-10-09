import { OfferTemplate } from "../offer.template.schema.js";
import { PipelineContext } from "@/modules/documents/generation/pipeline.js";
import { fetchOfferData } from "./actions.js";

export type OfferFetchData = Awaited<ReturnType<typeof fetchOfferData>>;

export type OfferPipelineContext = PipelineContext & {
  offerId: string;

  fetchedData?: OfferFetchData;
  formatedData?: OfferTemplate;
}
