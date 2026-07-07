import { Request, Response } from "express";

import * as contactPersonService from "../services/contact-person.service.js";

/* ========== GET ========== */

export const getAllContactPersons = async (request: Request, response: Response) => {
    const contactPersons = await contactPersonService.getAllContactPersons();
    return response.status(200).json(contactPersons);
};
