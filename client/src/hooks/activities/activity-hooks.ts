import { useQuery } from "@tanstack/react-query";
import { activityQueries } from "./activity-queries";
import type { ActivitiesPage, ActivityFilterParams } from "@keepit/schemas";

const EMPTY_PAGE: ActivitiesPage = { items: [], nextCursor: null };

/**
 * Der Feed wird bewusst nur beim Mounten geholt — aktualisiert wird über den
 * Reload-Button, nicht über ein Intervall oder einen offenen Stream.
 */
export function useActivities(filters: ActivityFilterParams = {}) {
    const { data = EMPTY_PAGE, isPending, isFetching, error, refetch } = useQuery(
        activityQueries.list(filters),
    );

    return {
        items: data.items,
        nextCursor: data.nextCursor,
        isPending,
        isFetching,
        error,
        refetch,
    };
}
