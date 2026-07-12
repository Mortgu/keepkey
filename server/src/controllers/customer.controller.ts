import { Request, Response } from "express";
import { AppException } from "../lib/exceptions.js";

import * as customerService from "../services/customer.service.js";

/* ========== GET ========== */

export const getCustomers = async (request: Request, response: Response) => {
    const customers = await customerService.getCustomers();
    return response.status(200).json(customers);
};

export const getCustomer = async (request: Request, response: Response) => {
    const customer = await customerService.getCustomerById(request.params.id as string);
    return response.status(200).json(customer);
};

export const getCustomerContacts = async (request: Request, response: Response) => {
    const contacts = await customerService.getCustomerContacts(request.params.id as string);
    return response.status(200).json(contacts);
};

export const getAllCustomerContacts = async (request: Request, response: Response) => {
    const customer = await customerService.getCustomerById(request.params.id as string);
    return response.status(200).json(customer.contactPersons);
};

/* ========== POST ========== */

export const createCustomer = async (request: Request, response: Response) => {
    if (!request.body) {
        throw new AppException("Bad request! Missing body data.", 400, "MISSING_BODY");
    }

    const customer = await customerService.createCustomer(request.body);
    return response.status(200).json(customer);
};

export const createCustomerContact = async (request: Request, response: Response) => {
    const contact = await customerService.createCustomerContact(
        request.params.id as string,
        request.body
    );
    return response.status(200).json(contact);
};

/* ========== UPDATE ========== */

export const updateCustomer = async (request: Request, response: Response) => {
    if (!request.body) {
        throw new AppException("Bad request! Missing body data.", 400, "MISSING_BODY");
    }

    await customerService.updateCustomer(request.params.id as string, request.body);
    return response.status(200).json({ message: "Successfully updated customer!" });
};

export const updateCustomerContact = async (request: Request, response: Response) => {
    const contact = await customerService.updateCustomerContact(
        request.params.contactId as string,
        request.body
    );
    return response.status(200).json(contact);
};

/* ========== DELETE ========== */

export const deleteCustomer = async (request: Request, response: Response) => {
    await customerService.deleteCustomer(request.params.id as string);
    return response.status(200).json({ message: "Successfully deleted customer!" });
};

export const deleteCustomerContact = async (request: Request, response: Response) => {
    await customerService.deleteCustomerContact(request.params.contactId as string);
    return response.status(200).json({ message: "Successfully deleted customer contact." });
};
