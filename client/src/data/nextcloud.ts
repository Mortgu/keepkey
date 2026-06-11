import {api} from "@/lib/api-client";

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
    files: Record<string, NextcloudFileMetadata[]>;
};

export const getNextcloudStatusAction = () =>
    api<NextcloudStatus>("/api/cloud/status", {method: "GET"});

export const findFilesByIdAction = (id: string) =>
    api<FindFilesByIdResult>(`/api/cloud/${id}`, {method: "GET"});

export const findOfferFilesByIdAction = (id: string) =>
    api<FindFilesByIdResult>(`/api/cloud/offer/${id}`, {method: "GET"});

export const findOrderFilesByIdAction = (id: string) =>
    api<FindFilesByIdResult>(`/api/cloud/order/${id}`, {method: "GET"});
