import { Request, Response } from "express";

import * as service from './person.service.js';

/* ========== GET ========== */

export const getAllPersons = async (request: Request, response: Response) => {
    const persons = await service.getAllPersons();
    return response.status(201).json(persons);
}

export const getPerson = async (request: Request, response: Response) => {
    const { id } = request.params;
    const persons = await service.getPerson(id as string);
    return response.status(201).json(persons);
}