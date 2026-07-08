import { OfferPosition } from "@prisma/client";

export function groupOfferPositions(offerPositions: Array<OfferPosition>) {
    return Object.groupBy(offerPositions, p => `${p.productId}_${p.contractId}_${p.duration_months}`);
}

export function formatPositionGroups(groups: ReturnType<typeof groupOfferPositions>) {

}