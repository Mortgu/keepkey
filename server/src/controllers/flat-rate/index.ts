import {NextFunction, Request, Response} from "express";
import {prisma} from "../../lib/prismaClient.js";

export const getFlatRates = async (request: Request, response: Response) => {
    const flatrates = await prisma.flatRate.findMany({
        orderBy: {key: "asc"},
        include: {translations: true},
    });
    return response.status(200).json(flatrates);
};

export const getFlatRate = async (request: Request, response: Response) => {
    const id = request.params.id as string;

    const flatrate = await prisma.flatRate.findUnique({
        where: {id},
        include: {translations: true},
    });

    if (!flatrate) {
        return response
            .status(404)
            .json({success: false, message: "Flat rate not found."});
    }

    return response.status(200).json(flatrate);
};

export const createFlatRate = async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const {key, total_cents, translations} = request.body;

        const flatrate = await prisma.flatRate.create({
            data: {
                key,
                total_cents,
                translations: {create: translations},
            },
            include: {translations: true},
        });

        return response.status(201).json(flatrate);
    } catch (error) {
        next(error);
    }
};

export const updateFlatRate = async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const id = request.params.id as string;
        const {key, total_cents, translations} = request.body;

        const flatrate = await prisma.flatRate.update({
            where: {id},
            data: {
                ...(key !== undefined ? {key} : {}),
                ...(total_cents !== undefined ? {total_cents} : {}),
                ...(Array.isArray(translations)
                    ? {
                          translations: {
                              upsert: translations.map((t: {language: "DE" | "EN"; name: string; table: string}) => ({
                                  where: {flatRateId_language: {flatRateId: id, language: t.language}},
                                  create: {language: t.language, name: t.name, table: t.table},
                                  update: {name: t.name, table: t.table},
                              })),
                          },
                      }
                    : {}),
            },
            include: {translations: true},
        });

        return response.status(200).json(flatrate);
    } catch (error) {
        next(error);
    }
};

export const deleteFlatRate = async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const id = request.params.id as string;

        await prisma.flatRate.delete({
            where: {id},
        });

        return response.status(200).json({success: true});
    } catch (error) {
        next(error);
    }
};
