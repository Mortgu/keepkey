import { prisma, TaskTarget } from "@/core/prisma.js";
import { OfferIncludeAll, offerIncludeAll } from "../offer.includes.js";

/*  */
export async function enqueueOfferDocumentGeneration(offerId: string) {
    const { language } = await prisma.offer.findUniqueOrThrow({
        where: { id: offerId },
        select: { language: true },
    });

    const offer = await prisma.offer.findUniqueOrThrow({
        where: { id: offerId },
        include: offerIncludeAll(language),
    });

    console.dir(offer, { depth: null })

    /* 
     *  Checks for existing document generation task 
     *  Returns existing or newly created task with status "PENDING"
     *  Creates the offer document entry with status "PENDING" in Postgres
     */
    const task = requestOfferDocumentTask(offer);


}

async function requestOfferDocumentTask(offer: OfferIncludeAll) {
    return await prisma.$transaction(async (transaction) => {
        await transaction.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`offer-generation:${offer.id}`}))::text AS "lock"`;

        const sourceVersion = offer.version;

        const activeDocumentTask = offer.offerDocuments.find(document => {
            return document.version === sourceVersion && (document.status === "PENDING" || document.status === "PROCESSING")
        })?.task;

        if (activeDocumentTask) {
            return {
                task: activeDocumentTask,
                created: false
            }
        }

        const { documentVersion } = await transaction.offer.update({
            where: { id: offer.id },
            data: {
                documentVersion: {
                    increment: 1
                }
            },
            select: {
                documentVersion: true
            }
        });

        const task = await transaction.task.create({
            data: {
                status: "PENDING",
                type: "GENERATION",
                target: TaskTarget.OFFER
            }
        });

        const workloadNames = offer.offerPositions.map(workload => workload.product)
        const documentDisplayName = generateOfferDocumentDisplayName(offer.quoteId, offer.customer.companyName, workloadNames,);

        await transaction.offerDocument.create({
            data: {
                displayName: '',
                offerId: offer.id,
                version: documentVersion,
                sourceVersion: sourceVersion,
                isCurrent: false,
                status: "PENDING",
                taskId: task.id
            }
        });

        return task;
    });
}

function generateOfferDocumentDisplayName(quoteId: string, companyName: string, workloads: Array<string>, version?: number) {
    return ""
}

