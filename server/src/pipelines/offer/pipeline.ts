import {OfferPipelineContext} from "./context.js";
import {runPipeline} from "../pipeline.js";
import {offerStages} from "./stages.js";

export default async function runOfferPipeline(context: OfferPipelineContext) {
    return await runPipeline(context, offerStages);
}
