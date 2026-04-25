import path from "path";
import fs from "fs/promises";

import { renderDocx } from "../utils/generation/renderers/docxRenderer.js";
import { convertDocxToPdf } from "../utils/generation/renderers/docxToPdfConverter.js";
import { getOfferTemplateData } from "./documentDataService.js";

import env from "../lib/env.js";

async function ensureOutputDir(jobId: string): Promise<string> {
    const dir = path.join(env.OUTPUT_DIR, jobId);
    await fs.mkdir(dir, { recursive: true });
    return dir;
}

export async function generateOffer(offerId: string, jobId: string): Promise<{ pdfPath: string; docxPath: string }> {
    const data = await getOfferTemplateData(offerId);
    const outDir = await ensureOutputDir(jobId);

    const docx = await renderDocx(path.join(env.TEMPLATES_DIR, "offer.docx"), data);
    const pdf = await convertDocxToPdf(docx);

    const pdfPath = path.join(outDir, "angebot.pdf");
    const docxPath = path.join(outDir, "angebot.docx");

    await Promise.all([
        fs.writeFile(pdfPath, pdf),
        fs.writeFile(docxPath, docx),
    ]);

    return { pdfPath, docxPath };
}

export async function generateInvoice(orderId: string, jobId: string)/*: Promise<{ pdfPath: string; docxPath: string }>*/ {
    /*
    const data = {};
    const outDir = await ensureOutputDir(jobId);

    const docx = await renderDocx(path.join(TEMPLATES_DIR, "invoice.docx"), data);
    const pdf = await convertDocxToPdf(docx);

    const pdfPath = path.join(outDir, "rechnung.pdf");
    const docxPath = path.join(outDir, "rechnung.docx");

    await Promise.all([
        fs.writeFile(pdfPath, pdf),
        fs.writeFile(docxPath, docx),
    ]);

    return { pdfPath, docxPath };
    */
}
