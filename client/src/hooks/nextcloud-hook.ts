import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getNextcloudPathsAction,
    getNextcloudStatusAction,
    saveNextcloudPathsAction,
    type NextcloudPaths,
} from "@/data/nextcloud";

export const useNextcloudStatus = () => {
    const { data, isPending, refetch } = useQuery({
        queryKey: ["nextcloud", "status"],
        queryFn: getNextcloudStatusAction,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    return {
        status: data?.status,
        detail: data?.detail,
        isPending,
        refetch,
    };
};

export const useNextcloudPaths = () => {
    const queryClient = useQueryClient();

    const { data: paths, isPending } = useQuery({
        queryKey: ["nextcloud", "paths"],
        queryFn: getNextcloudPathsAction,
    });

    const saveMutation = useMutation({
        mutationFn: (data: NextcloudPaths) => saveNextcloudPathsAction(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["nextcloud"] });
        },
    });

    return {
        paths,
        isPending,
        savePaths: saveMutation.mutateAsync,
        isSaving: saveMutation.isPending,
        saveError: saveMutation.error,
    };
};
