import { TaskStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { OfferPipelineContext } from "./context.js";
import { offerStages } from "./stages.js";
import { runPipeline } from "../pipeline.js";

type Result = {
  displayName: string;
};

export async function generateOfferDocument(offerId: string, taskId: string, documentId: string, version: number): Promise<Result> {
  const ctx: OfferPipelineContext = { offerId, taskId, documentId, version };
  const result = await runPipeline(ctx, offerStages);

  return {
    displayName: result.displayName!,
  };
}
