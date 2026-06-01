import {Request, Response} from "express";
import {prisma} from "../lib/prismaClient.js";

export const getAllContracts = async (request: Request, response: Response) => {
    const contracts = await prisma.contract.findMany();
    return response.status(200).json(contracts);
};

export const createContract = async (request: Request, response: Response) => {
    const {body} = request;

    if (!body) {
        return response.status(400).json({
            message: "Bad request",
            success: false,
        });
    }

    const createdContract = await prisma.contract.create({data: body});
    return response.status(200).json(createdContract);
};

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
