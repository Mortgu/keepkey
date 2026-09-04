import { Request, Response } from "express";

import * as templateService from "../services/document-template.service.js";
import { uploadDocumentTemplateQuerySchema } from "@/schemas/document-template-schemas.js";

export const getDocumentTemplates = async (_request: Request, response: Response) => {
    return response.status(200).json(await templateService.listTemplates());
};

export const uploadDocumentTemplate = async (request: Request, response: Response) => {
    // `validateQuery` prueft nur — in Express 5 ist `request.query` ein Getter
    // und laesst sich nicht zurueckschreiben. Also hier noch einmal parsen, um
    // die konvertierten Werte zu bekommen.
    const query = uploadDocumentTemplateQuerySchema.parse(request.query);

    const template = await templateService.createTemplate({
        kind: query.kind,
        language: query.language,
        name: query.name,
        fileName: query.fileName,
        content: request.body as Buffer,
        userId: request.user?.id,
    });

    return response.status(201).json(template);
};

export const replaceDocumentTemplateContent = async (request: Request, response: Response) => {
    const template = await templateService.replaceTemplateContent(
        request.params.id as string,
        request.body as Buffer,
    );

    return response.status(200).json(template);
};

export const renameDocumentTemplate = async (request: Request, response: Response) => {
    const template = await templateService.renameTemplate(
        request.params.id as string,
        request.body.name as string,
    );

    return response.status(200).json(template);
};

export const activateDocumentTemplate = async (request: Request, response: Response) => {
    const template = await templateService.setActiveTemplate(request.params.id as string);
    return response.status(200).json(template);
};

export const deleteDocumentTemplate = async (request: Request, response: Response) => {
    await templateService.deleteTemplate(request.params.id as string);
    return response.status(204).send();
};

/**
 * Liefert die Bytes durch den Server statt per signierter URL.
 *
 * Der DOCX-Editor liest hierueber. Ueber eine signierte URL haenge die
 * Vorlagenbearbeitung an der CORS-Regel des Buckets — genau die kann in
 * manchen Umgebungen fehlen, und dann waere die Verwaltung unbenutzbar.
 * Vorlagen sind klein genug, dass der Umweg nichts kostet.
 */
export const getDocumentTemplateContent = async (request: Request, response: Response) => {
    const { content } = await templateService.getTemplateContent(request.params.id as string);

    response.setHeader("Content-Type", templateService.DOCX_MIME);
    response.setHeader("Content-Length", String(content.length));

    return response.status(200).send(content);
};

export const downloadDocumentTemplate = async (request: Request, response: Response) => {
    const url = await templateService.getTemplateDownloadUrl(request.params.id as string);
    return response.redirect(302, url);
};
