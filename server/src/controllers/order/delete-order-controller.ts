import {Request, Response} from "express";
import {prisma} from "../../lib/prismaClient.js";

export const deleteOrderById = async (request: Request, response: Response) => {
    const {id} = request.params;

    await prisma.order.delete({
        where: {id: id as string},
    });

    return response.status(200).send({
        message: "Deletion successfully",
        success: true,
    });
};
