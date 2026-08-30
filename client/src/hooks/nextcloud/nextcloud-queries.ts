import { queryOptions } from "@tanstack/react-query";
import { findFilesById, findOfferFilesById, findOrderFilesById, getCloudDirectory, getTemplates } from "./nextcloud-api";
import { nextcloudKeys } from "./nextcloud-keys";
import type { CloudFile } from "@keepit/schemas";
import type { FindFilesByIdResult } from "@/data/nextcloud";

export const nextcloudQueries = {
    files: (id: string) => queryOptions<FindFilesByIdResult>({
        queryKey: nextcloudKeys.files(id),
        queryFn: () => findFilesById(id),
        enabled: Boolean(id),
        staleTime: 30_000,
    }),
    offerFiles: (id: string) => queryOptions<FindFilesByIdResult>({
        queryKey: nextcloudKeys.offerFiles(id),
        queryFn: () => findOfferFilesById(id),
        enabled: Boolean(id),
        staleTime: 30_000,
    }),
    orderFiles: (id: string) => queryOptions<FindFilesByIdResult>({
        queryKey: nextcloudKeys.orderFiles(id),
        queryFn: () => findOrderFilesById(id),
        enabled: Boolean(id),
        staleTime: 30_000,
    }),
    directory: (path: string) => queryOptions<Array<CloudFile>>({
        queryKey: nextcloudKeys.directory(path),
        queryFn: () => getCloudDirectory(path),
        enabled: Boolean(path),
        staleTime: 30_000,
    }),
    templates: () => queryOptions<Array<CloudFile>>({
        queryKey: nextcloudKeys.templates(),
        queryFn: getTemplates,
        staleTime: 30_000,
    }),
};
