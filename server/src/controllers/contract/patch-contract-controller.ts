import {Request, Response} from "express";
import {prisma} from "../../lib/prismaClient.js";


export const updateContract = async (request: Request, response: Response) => {
    const id = request.params.id as string;
    const {body} = request;

    if (!body) {
        return response
            .status(400)
            .json({message: "Bad request", success: false});
    }

    const {key, translations} = body;

    const updatedContract = await prisma.contract.update({
        where: {id},
        data: {
            ...(key !== undefined ? {key} : {}),
            ...(Array.isArray(translations)
                ? {
                      translations: {
                          upsert: translations.map((t: {language: "DE" | "EN"; name: string; features?: string[]; table?: string}) => ({
                              where: {contractId_language: {contractId: id, language: t.language}},
                              create: {language: t.language, name: t.name, features: t.features ?? [], table: t.table},
                              update: {name: t.name, features: t.features ?? [], table: t.table},
                          })),
                      },
                  }
                : {}),
        },
        include: {translations: true},
    });

    return response.status(200).json(updatedContract);
};