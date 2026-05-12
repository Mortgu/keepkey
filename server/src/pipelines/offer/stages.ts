import path from "path";
import fs from "fs/promises";

import env from "../../lib/env.js";
import {
  fetchOfferData,
  formatFetchedData,
  postprocessing,
  generating,
  converting,
} from "./actions.js";
import { OfferPipelineContext } from "./context.js";
import { Stage } from "./pipeline.js";
import { TaskStatus } from "@prisma/client";

const loadOfferData: Stage<OfferPipelineContext> = {
  name: "fetch",
  status: TaskStatus.RUNNING,
  run: async (context) => {
    context.fetchedData = await fetchOfferData(context.offerId);
  },
};

const preprocess: Stage<OfferPipelineContext> = {
  name: "preprocess",
  run: async (context) => {
    context.formatedData = await formatFetchedData(context.fetchedData);
  },
};

const postprocess: Stage<OfferPipelineContext> = {
  name: "postprocess",
  run: async (context) => {
    console.dir(context, { depth: null });
    context.formatedData = await postprocessing(context.formatedData);
  },
};

const prepare: Stage<OfferPipelineContext> = {
  name: "prepare",
  run: async () => {
    await fs.mkdir(env.OUTPUT_DIR, { recursive: true });
  },
};

const generate: Stage<OfferPipelineContext> = {
  name: "generate",
  run: async (context) => {
    context.docxBuffer = await generating(context.formatedData);
  },
};

const convert: Stage<OfferPipelineContext> = {
  name: "convert",
  run: async (context) => {
    context.pdfBuffer = await converting(context.docxBuffer!);
  },
};

const write: Stage<OfferPipelineContext> = {
  name: "write",
  run: async (context) => {
    const offer = context?.fetchedData?.offer;

    if (!offer) {
      throw new Error("Offer is null!");
    }

    const { quoteId, customer, offerPositions } = offer;
    const { companyName } = customer;
    const workloads = offerPositions
      .map((i) => i.product.name.replaceAll(" ", ""))
      .join("+");

    const baseName = `${quoteId}_AG_${companyName.replaceAll(" ", "").trim()}_Keepit-${workloads}`;
    context.displayName = `${baseName}_v${context.version}`;

    const docxPath = path.join(env.OUTPUT_DIR, `${context.documentId}.docx`);
    const pdfPath = path.join(env.OUTPUT_DIR, `${context.documentId}.pdf`);

    await Promise.all([
      fs.writeFile(docxPath, context.docxBuffer!),
      fs.writeFile(pdfPath, context.pdfBuffer!),
    ]);
  },
};

export const offerStages: Stage<OfferPipelineContext>[] = [
  loadOfferData,
  preprocess,
  postprocess,
  prepare,
  generate,
  convert,
  write,
];
