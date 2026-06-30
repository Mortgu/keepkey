import { NextFunction, Request, Response } from "express";
import { calculatePriceOrThrow } from "../../utils/products.js";
import { OfferFlatRate, OfferPosition } from "@prisma/client";
import { prisma } from "../../lib/prismaClient.js";
import { toDate } from "../../utils/utils.js";

export const updateOffer = async (request: Request, response: Response, next: NextFunction) => {
    const oid = request.params.id as string;
    const data = request.body;

    if (!data) {
        return response.status(400).json({ message: 'Bad request! Missing body!' });
    }

    const { positions = [], flatrates = [] } = data;
    const { id: _, supplierId, validUntil, requestFrom, date, ...scalarFields } = data.offer;

    for (const position of positions) {
        position["total_cents"] = await calculatePriceOrThrow({
            productId: position.productId,
            contractId: position.contractId,
            duration: position.duration_months,
            quantity: position.quantity,
            customerId: data.offer?.customerId,
        });

        console.log(position)
    }

    try {
        for (const flatrate of flatrates) {
            const rate = await prisma.flatRate.findUniqueOrThrow({
                where: { id: flatrate.flatRateId },
                select: { total_cents: true }
            });
            flatrate["total_cents"] = rate.total_cents * flatrate.quantity;
        }

        const offer = await prisma.$transaction(async (tx) => {
            const net_amount =
                positions.reduce((sum: number, p: OfferPosition) => sum + p.total_cents, 0) +
                flatrates.reduce((sum: number, p: OfferFlatRate) => sum + p.total_cents, 0);

            const current = await tx.offer.findFirstOrThrow({
                where: { id: oid },
                include: { offerPositions: true, offerFlatRates: true },
            });

            await tx.offerRevision.create({
                data: {
                    offerId: oid,
                    version: current.version,
                    changedById: data.offer.userId,
                    snapshot: current as any
                },
            });

            const quoteIdChanged = 'quoteId' in scalarFields && scalarFields.quoteId !== current.quoteId;

            const [offer] = await tx.offer.updateManyAndReturn({
                where: { id: oid },
                data: {
                    ...scalarFields,
                    date: toDate(date) ?? new Date(),
                    supplierId: supplierId || null,
                    validUntil: toDate(validUntil),
                    requestFrom: toDate(requestFrom),
                    net_amount,
                    version: { increment: 1 },
                },
            });

            await replacePositions(tx, oid, positions);
            await replaceFlatRates(tx, oid, flatrates);

            return offer;
        });

        return response.status(200).json(offer);
    } catch (exception: any) {
        console.error('updateOffer error:', exception.message, JSON.stringify(exception, null, 2));
        return response.status(500).json({
            message: 'Something went wrong trying to update offer',
            detail: exception.message,
            exception
        });
    }
}

async function replacePositions(tx: any, offerId: string, positions: OfferPosition[]) {
    await tx.offerPosition.deleteMany({ where: { offerId } });
    for (const { productId, contractId, duration_months, quantity, optional, total_cents } of positions) {
        await tx.offerPosition.create({
            data: { offerId, productId, contractId, duration_months, quantity, total_cents, optional },
        });
    }
}

async function replaceFlatRates(tx: any, offerId: string, flatRates: OfferFlatRate[]) {
    await tx.offerFlatRate.deleteMany({ where: { offerId } });
    for (const { flatRateId, quantity, total_cents } of flatRates) {
        await tx.offerFlatRate.create({
            data: { offerId, flatRateId, quantity, total_cents },
        });
    }
}
