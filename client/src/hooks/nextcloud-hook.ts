import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useIntegrationStatus} from "./use-integration-status";
import type {CloudFile} from "@/types/cloud.ts";
import type {FindFilesByIdResult} from "@/data/nextcloud";
import {
    
    deleteTemplateAction,
    findFilesByIdAction,
    findOfferFilesByIdAction,
    findOrderFilesByIdAction,
    getCloudDirectoryAction,
    getTemplatesAction,
    uploadTemplateAction
} from "@/data/nextcloud";

export const useNextcloudStatus = () => {
    const {data, isPending, refetch} = useIntegrationStatus();

    const entry = data?.nextcloud;
    const connected = entry?.status === "connected";

    return {
        connected,
        status: connected ? "connected" : "not_configured" as const,
        detail: !connected && !isPending ? entry?.detail : undefined,
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

export const useGetCloudDirectory = (path: string, options?: { enabled?: boolean }) => {
    return useQuery<Array<CloudFile>>({
        queryKey: ["cloud", "directory", path],
        queryFn: () => getCloudDirectoryAction(path),
        enabled: Boolean(path) && (options?.enabled ?? true),
        staleTime: 30_000,
    })
}

export const useGetTemplates = (options?: { enabled?: boolean }) => {
    return useQuery<Array<CloudFile>>({
        queryKey: ["cloud", "templates"],
        queryFn: getTemplatesAction,
        enabled: options?.enabled ?? true,
        staleTime: 30_000,
    });
};

export const useUploadTemplate = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({file}: { file: File }) => uploadTemplateAction(file),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: ["cloud", "templates"],
        }),
    });

    return {
        uploadTemplate: mutation.mutateAsync,
        isUploadingTemplate: mutation.isPending,
        errorUploadingTemplate: mutation.error,
    };
};

export const useDeleteTemplate = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({basename}: { basename: string }) => deleteTemplateAction(basename),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: ["cloud", "templates"],
        }),
    });

    return {
        deleteTemplate: mutation.mutateAsync,
        isDeletingTemplate: mutation.isPending,
        errorDeletingTemplate: mutation.error,
    };
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
