import {Task} from "@prisma/client";
import logger from "../../../middlewares/logger.js";
import {enqueueOfferGeneration} from "./offer-generate-job.js";
import {prisma} from "../../../lib/prismaClient.js";
import env from "../../../lib/env.js";
import {nextCloudRepository} from "../../../repositories/index.js";
import path from "path";

export async function offerReservationJob(task: Task, chainGenerationOnSuccess?: boolean) {
    const offer = await prisma.offer.findFirst({
        where: {reservationTaskId: task.id},
    });

    if (!offer) {
        throw new Error("Offer not found for reservation task");
    }

    logger.info(`[reservation] Reserving quoteId "${offer.quoteId}" in NextCloud`);

    // TODO: throw new Error("quoteId already taken") if NextCloud returns a conflict
    const docxCloudName = await nextCloudRepository.reserveFile(offer.quoteId, env.NEXTCLOUD_OFFER_ORIGINAL_PATH);
    const docxCloudPath = path.join(env.NEXTCLOUD_OFFER_ORIGINAL_PATH, docxCloudName);
    const pdfCloudName = await nextCloudRepository.reserveFile(offer.quoteId, env.NEXTCLOUD_OFFER_PDF_PATH);
    const pdfCloudPath = path.join(env.NEXTCLOUD_OFFER_PDF_PATH, pdfCloudName);

    await prisma.$transaction(async (tx) => {
        const latestOfferDoc = await tx.offerDocument.findFirst({
            where: {offerId: offer.id},
            orderBy: {version: "desc"},
            select: {version: true},
        });
        const version = (latestOfferDoc?.version ?? 0) + 1;

        const docxDoc = await tx.document.create({
            data: {
                displayName: "",
                format: "RESERVED",
                status: "UPLOADED",
                path: docxCloudPath
            },
        });
        await tx.offerDocument.create({
            data: {offerId: offer.id, documentId: docxDoc.id, version, isCurrent: true},
        });

        const pdfDoc = await tx.document.create({
            data: {format: "RESERVED", status: "UPLOADED", path: pdfCloudPath},
        });
        await tx.offerDocument.create({
            data: {offerId: offer.id, documentId: pdfDoc.id, version, isCurrent: true},
        });
    });

    if (chainGenerationOnSuccess) {
        await enqueueOfferGeneration(offer.id);
    }
}
