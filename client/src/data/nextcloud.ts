import { api } from "@/lib/api-client";

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

export const findOfferFilesByIdAction = (id: string) =>
    api<FindFilesByIdResult>(`/api/cloud/offer/${id}`, { method: "GET" });

