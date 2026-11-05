import type {Request, Response} from "express";

import * as service from "../services/invoice.service.js";

export const getAllInvoices = async (request: Request, response: Response) => {
    const invoices = await service.getAllInvoices(request.query);
    return response.status(200).json(invoices);
};

export const getInvoice = async (request: Request, response: Response) => {
    const invoice = await service.getInvoiceByOrder(request.params.orderId as string);
    return response.status(200).json(invoice);
};

export const createInvoice = async (request: Request, response: Response) => {
    const invoice = await service.createInvoice(
        request.params.orderId as string,
        request.body,
        request.user!.id,
    );
    return response.status(201).json(invoice);
};

export const regenerateInvoice = async (request: Request, response: Response) => {
    const task = await service.regenerateInvoice(request.params.orderId as string);
    return response.status(200).json(task);
};

export const deleteInvoice = async (request: Request, response: Response) => {
    await service.deleteInvoice(request.params.orderId as string);
    return response.status(204).send();
};
