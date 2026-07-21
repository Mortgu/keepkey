import type { CloudFile } from "@/types/cloud";
import type { FindFilesByIdResult, NextcloudStatus } from "@/data/nextcloud";
import { api, BASE_URL } from "@/lib/api-client";

export const getNextcloudStatus = () =>
    api<NextcloudStatus>("/api/cloud/status", { method: "GET" });

export const findFilesById = (id: string) =>
    api<FindFilesByIdResult>(`/api/cloud/${id}`, { method: "GET" });

export const findOfferFilesById = (id: string) =>
    api<FindFilesByIdResult>(`/api/cloud/offer/${id}`, { method: "GET" });

export const findOrderFilesById = (id: string) =>
    api<FindFilesByIdResult>(`/api/cloud/order/${id}`, { method: "GET" });

export const getTemplates = () =>
    api<Array<CloudFile>>("/api/cloud/templates", { method: "GET" });

export const uploadTemplate = (file: File) => {
    const urlParams = new URLSearchParams();
    urlParams.set("filename", file.name);
    return api(`/api/cloud/templates?${urlParams.toString()}`, {
        method: "POST",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
    });
};

export const deleteTemplate = (basename: string) =>
    api(`/api/cloud/templates/${encodeURIComponent(basename)}`, { method: "DELETE" });

export const templateDownloadUrl = (basename: string) =>
    `${BASE_URL}/api/cloud/templates/${encodeURIComponent(basename)}/download`;

export const getCloudDirectory = (path: string) => {
    const urlParams = new URLSearchParams();
    urlParams.set("path", path);
    return api<Array<CloudFile>>(`/api/cloud/directory?${urlParams.toString()}`, {
        method: "GET",
    });
};
