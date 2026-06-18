import {Request, Response} from "express";
import {prisma} from "../../lib/prismaClient.js";

export const getAllContactPersons = async (request: Request, response: Response) => {
    const contactPersons = await prisma.contactPerson.findMany({
        include: {
            customer: true,
        },
        orderBy: {
            lastName: "asc",
        },
    });

    return response.status(200).json(contactPersons);
};
