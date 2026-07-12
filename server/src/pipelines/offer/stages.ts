import {PipelineStage} from "../pipeline.js";
import {OfferPipelineContext} from "./context.js";
import {
  convertAction,
  createDisplayNameAction,
  fetchOfferAction,
  formatFetchedDataAction,
  generateAction,
  postProcessingAction
} from "./actions.js";

/* fetching everything need from the database */
const fetchingStage: PipelineStage<OfferPipelineContext> = {
    name: "fetch",
    run: fetchOfferAction,
}

/* formatting fetched data into the needed object */
const formattingStage: PipelineStage<OfferPipelineContext> = {
    name: "formatting",
    run: formatFetchedDataAction,
}

/* deep iterate placeholders like {product.names} in formatted data  */
const postProcessingStage: PipelineStage<OfferPipelineContext> = {
    name: "postprocessing",
    run: postProcessingAction,
}

const generateStage: PipelineStage<OfferPipelineContext> = {
    name: "generate",
    run: generateAction
}

const convertStage: PipelineStage<OfferPipelineContext> = {
    name: "convert",
    run: convertAction
}

const metadataStage: PipelineStage<OfferPipelineContext> = {
    name: "metadata",
    run: createDisplayNameAction,
}

export const offerStages: PipelineStage<OfferPipelineContext>[] = [
    fetchingStage,
    formattingStage,
    postProcessingStage,
    generateStage,
    convertStage,
    metadataStage
];
