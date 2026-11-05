import type {Request, Response} from "express";

import * as service from "../services/contract.service.js";

/* ========== GET ========== */

export const getAllContracts = async (request: Request, response: Response) => {
    const contracts = await service.getAllContracts();
    return response.status(200).json(contracts);
};

export const getContract = async (request: Request, response: Response) => {
    const contractId = request.params.id as string;
    const contract = await service.getContract(contractId);
    return response.status(200).json(contract);
};

/* ========== POST ========== */

export const createContract = async (request: Request, response: Response) => {
    const contract = await service.createContract(request.body);
    return response.status(200).json(contract);
};

/* ========== UPDATE ========== */

export const updateContract = async (request: Request, response: Response) => {
    const contract = await service.updateContract(
        request.params.id as string,
        request.body
    );
    return response.status(200).json(contract);
};

export const reorderContracts = async (request: Request, response: Response) => {
    await service.reorderContracts(request.body.ids);
    return response.status(200).json({success: true});
};

/* ========== DELETE ========== */

export const deleteContract = async (request: Request, response: Response) => {
    await service.deleteContract(request.params.id as string);
    return response.status(200).json({success: true});
};
