import type {Request, Response} from "express";

import * as service from "../services/customer.service.js";

/* ========== GET ========== */

export const getCustomers = async (request: Request, response: Response) => {
    const customers = await service.getCustomers(request.query);
    return response.status(200).json(customers);
};

export const getCustomer = async (request: Request, response: Response) => {
    const customer = await service.getCustomerById(request.params.id as string);
    return response.status(200).json(customer);
};

export const getCustomerContacts = async (request: Request, response: Response) => {
    const contacts = await service.getCustomerContacts(request.params.id as string);
    return response.status(200).json(contacts);
};

export const getAllCustomerContacts = async (request: Request, response: Response) => {
    const customer = await service.getCustomerById(request.params.id as string);
    return response.status(200).json(customer.contactPersons);
};

/* ========== POST ========== */

export const createCustomer = async (request: Request, response: Response) => {
    const customer = await service.createCustomer(request.body);
    return response.status(200).json(customer);
};

export const createCustomerContact = async (request: Request, response: Response) => {
    const contact = await service.createCustomerContact(
        request.params.id as string,
        request.body
    );
    return response.status(200).json(contact);
};

/* ========== UPDATE ========== */

export const updateCustomer = async (request: Request, response: Response) => {
    await service.updateCustomer(request.params.id as string, request.body);
    return response.status(200).json({message: "Successfully updated customer!"});
};

export const updateCustomerContact = async (request: Request, response: Response) => {
    const contact = await service.updateCustomerContact(
        request.params.contactId as string,
        request.body
    );
    return response.status(200).json(contact);
};

/* ========== DELETE ========== */

export const deleteCustomer = async (request: Request, response: Response) => {
    await service.deleteCustomer(request.params.id as string);
    return response.status(200).json({message: "Successfully deleted customer!"});
};

export const deleteCustomerContact = async (request: Request, response: Response) => {
    await service.deleteCustomerContact(request.params.contactId as string);
    return response.status(200).json({message: "Successfully deleted customer contact."});
};
