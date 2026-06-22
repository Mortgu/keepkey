import {api} from "@/lib/api-client";
import type {CloudFile} from "@/types/cloud.ts";

export type NextcloudStatus = {
    message: string;
};

export type NextcloudFileMetadata = {
    basename: string;
    filename: string;
    size: number;
    lastmod: string;
    mime: string | null;
};

export type FindFilesByIdResult = {
    id: string;
    found: boolean;
    files: Record<string, Array<NextcloudFileMetadata>>;
};

export const getNextcloudStatusAction = () =>
    api<NextcloudStatus>("/api/cloud/status", {method: "GET"});

export const findFilesByIdAction = (id: string) =>
    api<FindFilesByIdResult>(`/api/cloud/${id}`, {method: "GET"});

export const findOfferFilesByIdAction = (id: string) =>
    api<FindFilesByIdResult>(`/api/cloud/offer/${id}`, {method: "GET"});

export const findOrderFilesByIdAction = (id: string) =>
    api<FindFilesByIdResult>(`/api/cloud/order/${id}`, {method: "GET"});

export const getCloudDirectoryAction = (path: string) => {
    const urlParams = new URLSearchParams();
    urlParams.set("path", path);

    const query = urlParams.toString();
    return api<Array<CloudFile>>(`/api/cloud/directory?${query}`, {
        method: "GET"
    });
}