import {Request, Response} from "express";
import {prisma} from "../lib/prismaClient.js";
import env from "../lib/env.js";
import {NextCloudSearch} from "../service/document/nextcloud-search.js";
import IDRegistry from "../service/document/id-registry.js";
import UploadOrchestrator from "../service/document/upload-orchestrator.js";
import NextCloudLocation from "../service/document/nextcloud-location.js";
import DocumentService from "../service/document/document-service.js";
import {createClient} from "webdav";

export const renameDocument = async (request: Request, response: Response) => {
    const {id} = request.params;
    const {displayName} = request.body;

    try {
        const updatedDocument = await prisma.document.update({
            where: {id: id as string},
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

export const uploadDocument = async (request: Request, response: Response) => {
    const {id} = request.params;

}

export const deleteDocument = async (request: Request, response: Response) => {
    const {id} = request.params;

    try {
        await prisma.document.delete({
            where: {id: id as string},
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

    const orchestrator = new UploadOrchestrator([
        new NextCloudLocation({name: "primary", baseUrl, username, password}),
        new NextCloudLocation({name: "secondary", baseUrl, username, password}),
    ]);

    const documentService = new DocumentService(search, orchestrator, prisma);

    return {search, registry, orchestrator, documentService} as const;
}

export const container = buildContainer();