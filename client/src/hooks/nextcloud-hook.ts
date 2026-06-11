import { useQuery } from "@tanstack/react-query";
import {
    getNextcloudStatusAction,
    findFilesByIdAction,
    findOfferFilesByIdAction,
    findOrderFilesByIdAction,
    type FindFilesByIdResult,
} from "@/data/nextcloud";

export const useNextcloudStatus = () => {
    const { data, isPending, refetch } = useQuery({
        queryKey: ["nextcloud", "status"],
        queryFn: getNextcloudStatusAction,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    const connected = data?.message === "ok";

    return {
        connected,
        status: connected ? "connected" : "not_configured" as const,
        detail: !connected && !isPending ? data?.message : undefined,
        isPending,
        refetch,
    };
};

export const useFindFilesById = (id: string | undefined, options?: { enabled?: boolean }) => {
    return useQuery<FindFilesByIdResult>({
        queryKey: ["nextcloud", "files", id],
        queryFn: () => findFilesByIdAction(id!),
        enabled: Boolean(id) && (options?.enabled ?? true),
        staleTime: 30_000,
    });
};

export const useFindOfferFilesById = (id: string | undefined, options?: { enabled?: boolean }) => {
    return useQuery<FindFilesByIdResult>({
        queryKey: ["nextcloud", "offer", id],
        queryFn: () => findOfferFilesByIdAction(id!),
        enabled: Boolean(id) && (options?.enabled ?? true),
        staleTime: 30_000,
    });
};

export const useFindOrderFilesById = (id: string | undefined, options?: { enabled?: boolean }) => {
    return useQuery<FindFilesByIdResult>({
        queryKey: ["nextcloud", "order", id],
        queryFn: () => findOrderFilesByIdAction(id!),
        enabled: Boolean(id) && (options?.enabled ?? true),
        staleTime: 30_000,
    });
};
