import { Request, Response } from "express";

import * as documentsService from "../services/documents.service.js";

/* ========== UPDATE ========== */

export const renameDocument = async (request: Request, response: Response) => {
    const document = await documentsService.renameDocument(
        request.params.id as string,
        request.body
    );
    return response.status(200).json(document);
};

/* ========== DELETE ========== */

export const deleteDocument = async (request: Request, response: Response) => {
    await documentsService.deleteDocument(request.params.id as string);
    return response.status(200).json({ message: "Document deleted!" });
};
