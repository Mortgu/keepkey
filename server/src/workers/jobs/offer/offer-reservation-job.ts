import {Task} from "@prisma/client";
import logger from "../../../middlewares/logger.js";
import {enqueueOfferGeneration} from "./offer-generate-job.js";
import {prisma} from "../../../lib/prismaClient.js";

export async function offerReservationJob(task: Task, chainGenerationOnSuccess?: boolean) {
    const offer = await prisma.offer.findFirst({
        where: {reservationTaskId: task.id},
    });

    if (!offer) {
        throw new Error("Offer not found for reservation task");
    }

    logger.info(`[reservation] Reserving quoteId "${offer.quoteId}" in NextCloud`);

    // TODO: call NextCloud API to reserve offer.quoteId
    // throw new Error("quoteId already taken") if NextCloud returns a conflict

    if (chainGenerationOnSuccess) {
        await enqueueOfferGeneration(offer.id);
    }
}
