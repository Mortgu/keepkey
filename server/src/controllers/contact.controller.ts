import { Request, Response } from "express";

import * as service from "../services/contact-person.service.js";

/* ========== GET ========== */

export const getAllPersons = async (_: Request, response: Response) => {
    const persons = await service.getAllPersons();
    return response.status(200).json(persons);
};

export const getPersonById = async (request: Request, response: Response) => {
    const { id } = request.params;
    const person = await service.getPersonById(id as string);
    return response.status(200).json(person);
};
