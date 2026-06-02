import {Task} from "@prisma/client";
import logger from "../../../middlewares/logger.js";
import {enqueueOfferGeneration} from "./offer-generate-job.js";
import {prisma} from "../../../lib/prismaClient.js";
import env from "../../../lib/env.js";
import {nextCloudRepository} from "../../../repositories/index.js";

export async function offerReservationJob(task: Task, chainGenerationOnSuccess?: boolean) {
    const offer = await prisma.offer.findFirst({
        where: {reservationTaskId: task.id},
    });

    if (!offer) {
        throw new Error("Offer not found for reservation task");
    }

    logger.info(`[reservation] Reserving quoteId "${offer.quoteId}" in NextCloud`);

    // TODO: throw new Error("quoteId already taken") if NextCloud returns a conflict
    const docxFilePath = await nextCloudRepository.reserveFile(offer.quoteId, env.NEXTCLOUD_OFFER_ORIGINAL_PATH);
    const pdfFilePath = await nextCloudRepository.reserveFile(offer.quoteId, env.NEXTCLOUD_OFFER_PDF_PATH);

    await prisma.offer.update({
        where: {id: offer.id},
        data: {
            isReserved: true,
            reservationFile: [docxFilePath, pdfFilePath]
        },
    });

    if (chainGenerationOnSuccess) {
        await enqueueOfferGeneration(offer.id);
    }
}
