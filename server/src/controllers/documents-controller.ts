import fs from 'fs';

import { Request, Response } from "express";
import { DocumentStatus, prisma } from "../lib/prismaClient.js";
import env from "../lib/env.js";
import { NextCloudSearch } from "../service/document/nextcloud-search.js";
import IDRegistry from "../service/document/id-registry.js";
import DocumentService from "../service/document/document-service.js";
import { createClient } from "webdav";
import path from 'path';

export const renameDocument = async (request: Request, response: Response) => {
    const { id } = request.params;
    const { displayName } = request.body;

    try {
        const updatedDocument = await prisma.document.update({
            where: { id: id as string },
            data: {
                displayName: displayName
            }
        });


        return response.status(200).json(updatedDocument)
    } catch (exception: any) {
        return response.status(500).json({
            message: 'Something went wrong trying to rename doucment!'
        })
    }
}

export const deleteDocument = async (request: Request, response: Response) => {
    const { id } = request.params;

    try {
        await prisma.document.delete({
            where: { id: id as string },
        });

        return response.status(200).json({
            message: 'Document deleted!'
        })
    } catch (exception: any) {
        return response.status(500).json({
            message: "Something went wrong trying to delete document!", exception: exception.message
        })
    }
}

const buildContainer = () => {
    const baseUrl = `${env.NEXTCLOUD_URL}/remote.php/dav/files/${env.NEXTCLOUD_USER}`;
    const username = env.NEXTCLOUD_USER;
    const password = env.NEXTCLOUD_PASSWORD;

    const webDAVClient = createClient(baseUrl, {
        username, password
    });

    const search = new NextCloudSearch(webDAVClient);
    const registry = new IDRegistry(search, webDAVClient);

    const documentService = new DocumentService(search, webDAVClient, prisma);

    return { search, registry, documentService } as const;
}

export const container = buildContainer();