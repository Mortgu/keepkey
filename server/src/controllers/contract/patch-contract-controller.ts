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

    const updatedContract = await prisma.contract.update({
        where: {id},
        data: body,
    });

    return response.status(200).json(updatedContract);
};