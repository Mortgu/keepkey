import type {Request, Response} from "express";

import * as service from "../services/contact-person.service.js";

/* ========== GET ========== */

export const getAllContactPersons = async (request: Request, response: Response) => {
    const contactPersons = await service.getAllContactPersons();
    return response.status(200).json(contactPersons);
};
