import {Request, Response} from "express";
import {prisma} from "../../lib/prismaClient.js";


export const deleteContract = async (request: Request, response: Response) => {
    const {id} = request.params;

    if (!id) {
        return response.status(400).json({
            message: "Bad request",
            success: false,
        });
    }

    const deletedContract = await prisma.contract.deleteMany({
        where: {id: id as string},
    });

    return response.status(200).send(deletedContract);
};
