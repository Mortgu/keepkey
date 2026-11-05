import type { Request, Response } from "express";
import type { DocumentFormatParam, DocumentType } from "@keepit/schemas";

import * as service from "../services/document/index.js";

export const getDocumentCapabilities = async (_request: Request, response: Response) => {
    return response.status(200).json(await service.getDocumentCapabilities());
};

export const renameDocument = async (request: Request, response: Response) => {
    const document = await service.renameDocument(
        request.params.type as DocumentType,
        request.params.documentId as string,
        request.body as service.RenameDocumentInput,
    );
    return response.status(200).json(document);
};

export const deleteDocument = async (request: Request, response: Response) => {
    await service.deleteDocument(
        request.params.type as DocumentType,
        request.params.documentId as string,
    );
    return response.status(204).send();
};

export const uploadDocument = async (request: Request, response: Response) => {
    await service.uploadDocument(
        request.params.type as DocumentType,
        request.params.documentId as string,
    );
    return response.status(204).send();
};

export const downloadDocument = async (request: Request, response: Response) => {
    const result = await service.downloadDocument(
        request.params.type as DocumentType,
        request.params.documentId as string,
        request.params.format as DocumentFormatParam,
    );
    return response.redirect(302, result.url);
};

export const getDocumentDownloadUrl = async (request: Request, response: Response) => {
    const result = await service.downloadDocument(
        request.params.type as DocumentType,
        request.params.documentId as string,
        request.params.format as DocumentFormatParam,
    );
    return response.status(200).json(result);
};

export const createReplacementUpload = async (request: Request, response: Response) => {
    const result = await service.createReplacementUpload(
        request.params.type as DocumentType,
        request.params.documentId as string,
        request.params.format as DocumentFormatParam,
    );
    return response.status(201).json(result);
};

export const confirmReplacementUpload = async (request: Request, response: Response) => {
    const document = await service.confirmReplacementUpload(
        request.params.type as DocumentType,
        request.params.documentId as string,
        request.params.format as DocumentFormatParam,
        request.body.objectKey as string,
    );
    return response.status(200).json(document);
};

export const resyncDocument = async (request: Request, response: Response) => {
    await service.resyncDocument(
        request.params.type as DocumentType,
        request.params.documentId as string,
    );
    return response.status(204).send();
};
