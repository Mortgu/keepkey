import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useIntegrationStatus } from "@/hooks/integrations/integration-hooks";
import { deleteTemplate, uploadTemplate } from "./nextcloud-api";
import { nextcloudKeys } from "./nextcloud-keys";
import { nextcloudQueries } from "./nextcloud-queries";

export function useNextcloudStatus() {
    const { data, isPending, refetch } = useIntegrationStatus();

    const entry = data?.nextcloud;
    const connected = entry?.status === "connected";

    return {
        connected,
        status: connected ? "connected" : "not_configured" as const,
        detail: !connected && !isPending ? entry?.detail : undefined,
        isPending,
        refetch,
    };
}

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

export function useGetTemplates(options?: { enabled?: boolean }) {
    return useQuery({
        ...nextcloudQueries.templates(),
        enabled: options?.enabled ?? true,
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

export function useUploadTemplate() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ file }: { file: File }) => uploadTemplate(file),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: nextcloudKeys.templates() }),
    });

    return {
        uploadTemplate: mutation.mutateAsync,
        isUploadingTemplate: mutation.isPending,
        errorUploadingTemplate: mutation.error,
    };
}

export function useDeleteTemplate() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ basename }: { basename: string }) => deleteTemplate(basename),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: nextcloudKeys.templates() }),
    });

    return {
        deleteTemplate: mutation.mutateAsync,
        isDeletingTemplate: mutation.isPending,
        errorDeletingTemplate: mutation.error,
    };
}
