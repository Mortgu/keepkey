import { Request, Response } from "express";

import * as contractService from "../services/contract.service.js";

/* ========== GET ========== */

export const getAllContracts = async (request: Request, response: Response) => {
    const contracts = await contractService.getAllContracts();
    return response.status(200).json(contracts);
};

export const getContract = async (request: Request, response: Response) => {
    const contractId = request.params.id as string;
    const contract = await contractService.getContract(contractId);
    return response.status(200).json(contract);
};

/* ========== POST ========== */

export const createContract = async (request: Request, response: Response) => {
    const contract = await contractService.createContract(request.body);
    return response.status(200).json(contract);
};

/* ========== UPDATE ========== */

export const updateContract = async (request: Request, response: Response) => {
    const contract = await contractService.updateContract(
        request.params.id as string,
        request.body
    );
    return response.status(200).json(contract);
};

/* ========== DELETE ========== */

export const deleteContract = async (request: Request, response: Response) => {
    await contractService.deleteContract(request.params.id as string);
    return response.status(200).json({ success: true });
};
