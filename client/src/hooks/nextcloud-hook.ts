import { useQuery } from "@tanstack/react-query";
import { getNextcloudStatusAction } from "@/data/nextcloud";

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
