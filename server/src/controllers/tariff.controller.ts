import { Request, Response } from "express";

import * as tariffService from "../services/tariff.service.js";

/* ========== GET ========== */

export const getTariffGroups = async (request: Request, response: Response) => {
    const groups = await tariffService.getTariffGroups();
    return response.status(200).json(groups);
};

export const getTariffGroup = async (request: Request, response: Response) => {
    const group = await tariffService.getTariffGroup(request.params.id as string);
    return response.status(200).json(group);
};

export const getTariff = async (request: Request, response: Response) => {
    const tariff = await tariffService.getTariff(request.params.tariffId as string);
    return response.status(200).json(tariff);
};

export const getTariffHistory = async (request: Request, response: Response) => {
    const history = await tariffService.getTariffHistory(
        request.params.productId as string,
        request.params.contractId as string
    );
    return response.status(200).json(history);
};

export const getTariffDurations = async (request: Request, response: Response) => {
    const durations = await tariffService.getTariffDurations(
        request.params.productId as string,
        request.params.contractId as string
    );
    return response.status(200).json(durations);
};

export const getTariffPrice = async (request: Request, response: Response) => {
    const { productId, contractId, duration, quantity, customerId, freeMonths } = request.query;

    const result = await tariffService.getTariffPrice(
        productId as string,
        contractId as string,
        Number(duration),
        Number(quantity),
        customerId as string | undefined,
        freeMonths ? Number(freeMonths) : undefined
    );

    return response.status(200).json({
        success: true,
        price: result.price,
        breakdown: result.breakdown,
    });
};

/* ========== POST ========== */

export const createTariffGroup = async (request: Request, response: Response) => {
    const group = await tariffService.createTariffGroup(request.body);
    return response.status(201).json(group);
};

export const createTariff = async (request: Request, response: Response) => {
    const tariffGroupId = request.params.id as string;
    const tariff = await tariffService.createTariff(tariffGroupId, request.body);
    return response.status(201).json(tariff);
};

export const createTariffColumn = async (request: Request, response: Response) => {
    const tariffId = request.params.tariffId as string;
    const updated = await tariffService.createTariffColumn(tariffId, request.body);
    return response.status(201).json(updated);
};

export const createTariffRow = async (request: Request, response: Response) => {
    const tariffId = request.params.tariffId as string;
    const updated = await tariffService.createTariffRow(tariffId, request.body);
    return response.status(201).json(updated);
};

/* ========== UPDATE ========== */

export const updateTariffGroup = async (request: Request, response: Response) => {
    const group = await tariffService.updateTariffGroup(
        request.params.id as string,
        request.body
    );
    return response.status(200).json(group);
};

export const updateTariffColumn = async (request: Request, response: Response) => {
    const columnId = request.params.columnId as string;
    const updated = await tariffService.updateTariffColumn(columnId, request.body);
    return response.status(200).json({ message: 'Column updated successfully!', updated });
};

export const updateTariffRow = async (request: Request, response: Response) => {
    const rowId = request.params.rowId as string;
    const updated = await tariffService.updateTariffRow(rowId, request.body);
    return response.status(200).json({ message: 'Row updated successfully!', updated });
};

export const updateTariffCell = async (request: Request, response: Response) => {
    const cellId = request.params.cellId as string;
    const updated = await tariffService.updateTariffCell(cellId, request.body);
    return response.status(200).json({ message: 'Cell updated successfully!', updated });
};

export const upsertCustomerPrice = async (request: Request, response: Response) => {
    const result = await tariffService.upsertCustomerPrice(request.body);
    return response.status(200).json({
        success: true,
        price: result.price,
        breakdown: result.breakdown,
    });
};

/* ========== DELETE ========== */

export const deleteTariffGroup = async (request: Request, response: Response) => {
    await tariffService.deleteTariffGroup(request.params.id as string);
    return response.status(200).json({ success: true, message: "TariffGroup deleted." });
};

export const deleteTariff = async (request: Request, response: Response) => {
    await tariffService.deleteTariff(request.params.tariffId as string);
    return response.status(200).json({ success: true, message: "Tariff deleted." });
};

export const deleteTariffColumn = async (request: Request, response: Response) => {
    const column = await tariffService.deleteTariffColumn(request.params.columnId as string);
    return response.status(200).json({ message: 'Column deleted successfully!', column });
};

export const deleteTariffRow = async (request: Request, response: Response) => {
    const row = await tariffService.deleteTariffRow(request.params.rowId as string);
    return response.status(200).json({ message: "Successfully deleted row!", row });
};

export const deleteCustomerPrice = async (request: Request, response: Response) => {
    const result = await tariffService.deleteCustomerPrice({
        productId: request.query.productId as string,
        contractId: request.query.contractId as string,
        duration: Number(request.query.duration),
        quantity: Number(request.query.quantity),
        customerId: request.query.customerId as string,
    });

    return response.status(200).json({
        success: true,
        price: result.price,
        breakdown: result.breakdown,
    });
};
