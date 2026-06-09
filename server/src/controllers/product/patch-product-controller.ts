import {NextFunction, Request, Response} from "express";
import {prisma} from "../../lib/prismaClient.js";

/*
 * Update Product
 * [PUT] http://localhost:3000/api/products/{id}
 */
export const updateProduct = async (request: Request, response: Response, next: NextFunction) => {
    const {id} = request.params;
    const body = request.body;

    if (!id || !body) {
        return response.status(400).json({
            success: false,
            message: "Bad request",
        });
    }

    const {key, translations} = body;

    const result = await prisma.product.update({
        where: {id: id as string},
        data: {
            ...(key !== undefined ? {key} : {}),
            ...(Array.isArray(translations)
                ? {
                      translations: {
                          upsert: translations.map((t: {language: "DE" | "EN"; name: string; description?: string; table?: string}) => ({
                              where: {productId_language: {productId: id as string, language: t.language}},
                              create: {language: t.language, name: t.name, description: t.description, table: t.table},
                              update: {name: t.name, description: t.description, table: t.table},
                          })),
                      },
                  }
                : {}),
        },
        include: {translations: true},
    });

    return response.status(200).json(result);
};
