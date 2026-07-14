import {api, BASE_URL} from "@/lib/api-client";
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

export const getTemplatesAction = () =>
    api<Array<CloudFile>>("/api/cloud/templates", {method: "GET"});

export const uploadTemplateAction = (file: File) => {
    const urlParams = new URLSearchParams();
    urlParams.set("filename", file.name);

    return api(`/api/cloud/templates?${urlParams.toString()}`, {
        method: "POST",
        body: file,
        headers: {"Content-Type": file.type || "application/octet-stream"},
    });
};

export const deleteTemplateAction = (basename: string) =>
    api(`/api/cloud/templates/${encodeURIComponent(basename)}`, {method: "DELETE"});

export const templateDownloadUrl = (basename: string) =>
    `${BASE_URL}/api/cloud/templates/${encodeURIComponent(basename)}/download`;

export const getCloudDirectoryAction = (path: string) => {
    const urlParams = new URLSearchParams();
    urlParams.set("path", path);

    const query = urlParams.toString();
    return api<Array<CloudFile>>(`/api/cloud/directory?${query}`, {
        method: "GET"
    });
}