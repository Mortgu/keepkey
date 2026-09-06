import type { CloudFile, FindFilesByIdResult } from "@keepit/schemas";
import { api } from "@/lib/api-client";

export const findFilesById = (id: string) =>
    api<FindFilesByIdResult>(`/api/cloud/${id}`, { method: "GET" });

export const findOfferFilesById = (id: string) =>
    api<FindFilesByIdResult>(`/api/cloud/offer/${id}`, { method: "GET" });

export const findOrderFilesById = (id: string) =>
    api<FindFilesByIdResult>(`/api/cloud/order/${id}`, { method: "GET" });

export const getCloudDirectory = (path: string) => {
    const urlParams = new URLSearchParams();
    urlParams.set("path", path);
    return api<Array<CloudFile>>(`/api/cloud/directory?${urlParams.toString()}`, {
        method: "GET",
    });
};
