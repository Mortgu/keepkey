import { TaskStatus } from "@prisma/client";
import { PipelineStage } from "../pipeline.js";
import { OfferPipelineContext } from "./context.js";
import { converteAction, fetchOfferAction, formatFetchedDataAction, generateAction, postProcessingAction, prepareAction, writeAction } from "./actions.js";

/* fetching everything need from the database */
const fetchingStage: PipelineStage<OfferPipelineContext> = {
  name: "fetch",
  status: TaskStatus.RUNNING,
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

/* Creates the output directory, ... */
const prepareStage: PipelineStage<OfferPipelineContext> = {
  name: "prepare",
  run: prepareAction,
}

const generateStage: PipelineStage<OfferPipelineContext> = {
  name: "generate",
  run: generateAction
}

const convertStage: PipelineStage<OfferPipelineContext> = {
  name: "convert",
  run: converteAction
}

const writeStage: PipelineStage<OfferPipelineContext> = {
  name: "write",
  run: writeAction,
}

export const offerStages: PipelineStage<OfferPipelineContext>[] = [
  fetchingStage,
  formattingStage,
  postProcessingStage,
  prepareStage,
  generateStage,
  convertStage,
  writeStage
];
