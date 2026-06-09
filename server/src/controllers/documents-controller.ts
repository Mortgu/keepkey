import { Request, Response } from "express";
import { prisma } from "../lib/prismaClient.js";

export const renameDocument = async (request: Request, response: Response) => {
    const { id } = request.params;
    const { displayName } = request.body;

    try {
        const updatedDocument = await prisma.document.update({
            where: { id: id as string },
            data: {
                displayName: displayName
            }
        });


        return response.status(200).json(updatedDocument)
    } catch (exception: any) {
        return response.status(500).json({
            message: 'Something went wrong trying to rename doucment!'
        })
    }
}

export const deleteDocument = async (request: Request, response: Response) => {
    const { id } = request.params;

    try {
        await prisma.document.delete({
            where: { id: id as string },
        });

        return response.status(200).json({
            message: 'Document deleted!'
        })
    } catch (exception: any) {
        return response.status(500).json({
            message: "Something went wrong trying to delete document!", exception: exception.message
        })
    }
}
