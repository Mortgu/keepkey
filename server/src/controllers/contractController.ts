import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const getAllContracts = async (request: Request, response: Response) => {
    const contracts = await prisma.contract.findMany();
    return response.status(200).json(contracts);
}

export const createContract = async (request: Request, response: Response) => {
    const { body } = request;

    if (!body) {
        return response.status(400).json({
            message: "Bad request", success: false
        });
    }

    const createdContract = await prisma.contract.create({ data: body });
    return response.status(200).json(createdContract);
}

export const deleteContract = async (request: Request, response: Response) => {
    const { body } = request;

    if (!body || !body.id) {
        return response.status(400).json({
            message: "Bad request", success: false
        });
    }

    const deletedContract = await prisma.contract.deleteMany({
        where: { id: body.id }
    });

    return response.status(200).send(deletedContract);
}