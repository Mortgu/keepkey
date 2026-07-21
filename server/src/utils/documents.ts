import { PipelineStageError } from "@/pipelines/pipeline.js";
import { OfferTemplateItem } from "@/schemas/templates/offer.template.schema.js";
import { Language, Prisma } from "@prisma/client";
import { pickTranslation } from "./i18n.js";
import { formatCentsToEur, formatDate } from "./utils.js";

export function generateOfferDisplayName(quoteId: string, companyName: string, products: Array<string>, version: number): string {
    const formatedCompanyName = companyName.replaceAll(" ", "").trim();
    const formatedWorkloads = products.join("+");

    let name = `${quoteId}_AG_${formatedCompanyName}_Keepit-${formatedWorkloads}`;

    if (version > 0)
        name = `${name}_v${version}`;

    return name;
}

type OfferPositionWithInclude = Prisma.OfferPositionGetPayload<{
    include: {
        contract: {
            include: { translations: true },
        },
        product: {
            include: { translations: true },
        }
    }
}>;



export function getOfferProductItems(
    offerPosition: OfferPositionWithInclude,
    language: Language,
    validUntil: Date | null,
): OfferTemplateItem {
    const { product, contract, optional } = offerPosition;

    const pt = pickTranslation(product.translations, language);
    const ct = pickTranslation(contract.translations, language);

    if (!pt || !ct) throw new PipelineStageError("Translations not found!");

    const name = `${optional ? `(optional)\n` : ''}Keepit - ${ct.name} Backup für ${pt.name}`;

    const item: OfferTemplateItem = {
        name: name,
        description: pt.description,
        content: pt.table,

        quantity: String(offerPosition.quantity),
        eur_user_month: formatCentsToEur(offerPosition.eur_user_month),
        duration: String(offerPosition.duration_months),
        total: formatCentsToEur(offerPosition.total_cents),
        contract: ct.name,
        optional: offerPosition.optional ? true : null,
        discount: null,
    }

    if (offerPosition.free_months > 0) {
        item.discount = {
            free_months: offerPosition.free_months,
            valid_until: formatDate(validUntil) ?? "",
            total: formatCentsToEur(-offerPosition.discount_cents),
        }
    }

    return item;
}