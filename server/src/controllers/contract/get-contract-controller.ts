import {Request, Response} from "express";
import {prisma} from "../../lib/prismaClient.js";

export const getAllContracts = async (request: Request, response: Response) => {
    const contracts = await prisma.contract.findMany();
    return response.status(200).json(contracts);
};
