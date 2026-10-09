import { Request, Response } from "express";
import * as invoiceService from "./invoice.service.js";

export const getAllInvoices = async (request: Request, response: Response) => {
    const invoices = await invoiceService.getAllInvoices(request.query);
    return response.status(200).json(invoices);
};

export const getInvoice = async (request: Request, response: Response) => {
    const invoice = await invoiceService.getInvoiceByOrder(request.params.orderId as string);
    return response.status(200).json(invoice);
};

export const createInvoice = async (request: Request, response: Response) => {
    const invoice = await invoiceService.createInvoice(
        request.params.orderId as string,
        request.body,
        request.user!.id,
    );
    return response.status(201).json(invoice);
};

export const regenerateInvoice = async (request: Request, response: Response) => {
    const task = await invoiceService.regenerateInvoice(request.params.orderId as string);
    return response.status(200).json(task);
};
