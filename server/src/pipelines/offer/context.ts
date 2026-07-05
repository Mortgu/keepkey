import { PipelineContext } from "../pipeline.js";
import { fetchOfferData } from "./actions.js";
import type { OfferContext } from "../../schemas/templates/offer-template-schema.js";

export type OfferFetchData = Awaited<ReturnType<typeof fetchOfferData>>;

export type OfferPipelineContext = PipelineContext & {
  offerId: string;

  fetchedData?: OfferFetchData;
  formatedData?: OfferContext;

  version: number;

  docxBuffer: Buffer | null;
  pdfBuffer: Buffer | null;

  displayName?: string;
}
