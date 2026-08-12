import { Request, Response } from "express";
import type { DocumentFormatParam, DocumentType } from "@keepit/schemas";
import * as documentsService from "../services/documents.service.js";

export const renameDocument = async (request: Request, response: Response) => {
    const document = await documentsService.renameDocument(
        request.params.type as DocumentType,
        request.params.documentId as string,
        request.body,
    );
    return response.status(200).json(document);
};

export const deleteDocument = async (request: Request, response: Response) => {
    await documentsService.deleteDocument(
        request.params.type as DocumentType,
        request.params.documentId as string,
    );
    return response.status(204).send();
};

export const uploadDocument = async (request: Request, response: Response) => {
    await documentsService.uploadDocument(
        request.params.type as DocumentType,
        request.params.documentId as string,
    );
    return response.status(204).send();
};

export const downloadDocument = async (request: Request, response: Response) => {
    const result = await documentsService.downloadDocument(
        request.params.type as DocumentType,
        request.params.documentId as string,
        request.params.format as DocumentFormatParam,
    );
    return response.redirect(302, result.url);
};

export const createReplacementUpload = async (request: Request, response: Response) => {
    const result = await documentsService.createReplacementUpload(
        request.params.type as DocumentType,
        request.params.documentId as string,
        request.params.format as DocumentFormatParam,
    );
    return response.status(201).json(result);
};

export const confirmReplacementUpload = async (request: Request, response: Response) => {
    const document = await documentsService.confirmReplacementUpload(
        request.params.type as DocumentType,
        request.params.documentId as string,
        request.params.format as DocumentFormatParam,
        request.body.objectKey as string,
    );
    return response.status(200).json(document);
};

export const resyncDocument = async (request: Request, response: Response) => {
    await documentsService.resyncDocument(
        request.params.type as DocumentType,
        request.params.documentId as string,
    );
    return response.status(204).send();
};