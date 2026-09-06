import { useQuery } from "@tanstack/react-query";
import { nextcloudQueries } from "./nextcloud-queries";

export function useFindFilesById(id: string | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        ...nextcloudQueries.files(id!),
        enabled: Boolean(id) && (options?.enabled ?? true),
    });
}

export function useGetCloudDirectory(path: string, options?: { enabled?: boolean }) {
    return useQuery({
        ...nextcloudQueries.directory(path),
        enabled: Boolean(path) && (options?.enabled ?? true),
    });
}

export function useFindOfferFilesById(id: string | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        ...nextcloudQueries.offerFiles(id!),
        enabled: Boolean(id) && (options?.enabled ?? true),
    });
}

export function useFindOrderFilesById(id: string | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        ...nextcloudQueries.orderFiles(id!),
        enabled: Boolean(id) && (options?.enabled ?? true),
    });
}
