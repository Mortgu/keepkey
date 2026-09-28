import { prisma } from "../../lib/prismaClient.js";
import { requestOfferGeneration } from "../document-generation-request.service.js";
import { generateOfferDisplayName } from "../../utils/documents.js";
import { pickTranslation } from "../../utils/i18n.js";

export async function enqueueGeneration(offerId: string) {
    const offer = await prisma.offer.findUniqueOrThrow({
        where: { id: offerId },
        include: {
            customer: true,
            offerPositions: {
                include: {
                    product: {
                        include: {
                            translations: true
                        }
                    }
                }
            }
        }
    });

    const formatedWorkloads = offer.offerPositions.map((op) => (
        pickTranslation(op.product.translations, offer.language)?.name ?? ""
    ).replaceAll(" ", "").trim());

    return requestOfferGeneration(offerId, (version) => generateOfferDisplayName(
        offer.quoteId,
        offer.customer.companyName,
        formatedWorkloads,
        version,
    ));
}
