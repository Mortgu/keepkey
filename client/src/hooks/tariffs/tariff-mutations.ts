import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { tariffKeys } from "./tariff-keys";
import {
    createTariff,
    createTariffColumn,
    createTariffGroup,
    createTariffRow,
    deleteTariff,
    deleteTariffColumn,
    deleteTariffGroup,
    deleteTariffRow,
    restoreTariffVersion,
    sealTariffVersion,
    updateTariffCell,
    updateTariffColumn,
    updateTariffGroup,
    updateTariffRow,
} from "./tariff-api";
import type {
    CreateTariffGroupInput,
    CreateTariffInput,
    UpdateTariffGroupInput,
} from "@keepit/schemas";

/**
 * Strukturänderungen an Zeilen, Spalten oder Zellen.
 *
 * Die Versionsliste muss mit invalidiert werden: Sie hängt unterhalb von `all`
 * und wird von `lists()` nicht erfasst — ohne das bliebe die `isCurrent`-Markierung
 * nach jeder Preisänderung veraltet stehen.
 */
const invalidateStructure = (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: tariffKeys.lists() });
    queryClient.invalidateQueries({ queryKey: tariffKeys.allVersions() });
};

const invalidateAll = (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: tariffKeys.all });
};

/**
 * `useMutation` mit der Invalidierung, die zu dieser Änderung gehört.
 *
 * Nimmt dem Aufrufer nur das wiederkehrende `useQueryClient` + `onSuccess` ab;
 * zurück kommt die unveränderte Mutation von React Query.
 *
 * Ob ein Hook danach `mutate` oder `mutateAsync` nach außen gibt, ist keine
 * Geschmacksfrage: `mutateAsync` überall würde in den Klick-Handlern, die das
 * Ergebnis nicht abwarten, unbehandelte Promise-Rejections erzeugen. Deshalb
 * `mutateAsync` nur dort, wo der Aufrufer wirklich sequenziert — und `mutate`,
 * wo der Fehler über `error` angezeigt wird.
 */
function useTariffMutation<TArgs, TResult>(
    mutationFn: (args: TArgs) => Promise<TResult>,
    invalidate: (queryClient: QueryClient) => void,
) {
    const queryClient = useQueryClient();
    return useMutation({ mutationFn, onSuccess: () => invalidate(queryClient) });
}

/* ───────────────────────────────
   TariffGroup
   ─────────────────────────────── */

export function useCreateTariffGroup() {
    const { mutate, isPending, error } = useTariffMutation(
        (input: CreateTariffGroupInput) => createTariffGroup(input),
        invalidateAll,
    );
    return { createTariffGroup: mutate, isPending, error };
}

export function useUpdateTariffGroup() {
    const { mutate, isPending, error } = useTariffMutation(
        ({ id, input }: { id: string; input: UpdateTariffGroupInput }) => updateTariffGroup(id, input),
        invalidateAll,
    );
    return { updateTariffGroup: mutate, isPending, error };
}

export function useDeleteTariffGroup() {
    const { mutate, isPending, error } = useTariffMutation(
        ({ id }: { id: string }) => deleteTariffGroup(id),
        invalidateAll,
    );
    return { deleteTariffGroup: mutate, isPending, error };
}

/* ───────────────────────────────
   Tariff
   ─────────────────────────────── */

export function useCreateTariff() {
    const { mutateAsync, isPending, error } = useTariffMutation(
        ({ groupId, input }: { groupId: string; input: CreateTariffInput }) => createTariff(groupId, input),
        invalidateAll,
    );
    return { createTariff: mutateAsync, isPending, error };
}

export function useDeleteTariff() {
    const { mutate, isPending, error } = useTariffMutation(
        ({ groupId, tariffId }: { groupId: string; tariffId: string }) => deleteTariff(groupId, tariffId),
        invalidateAll,
    );
    return { deleteTariff: mutate, isPending, error };
}

/* ───────────────────────────────
   Version
   ─────────────────────────────── */

export function useSealTariffVersion() {
    const { mutateAsync, isPending, error } = useTariffMutation(
        ({ groupId, tariffId }: { groupId: string; tariffId: string }) => sealTariffVersion(groupId, tariffId),
        invalidateStructure,
    );
    return { sealVersion: mutateAsync, isPending, error };
}

export function useRestoreTariffVersion() {
    const { mutateAsync, isPending, error } = useTariffMutation(
        ({ groupId, tariffId, versionId }: { groupId: string; tariffId: string; versionId: string }) =>
            restoreTariffVersion(groupId, tariffId, versionId),
        // Ein Restore ersetzt die gesamte Struktur und legt zusätzlich eine
        // RESTORE-Version an — deshalb alles invalidieren.
        invalidateAll,
    );
    return { restoreVersion: mutateAsync, isPending, error };
}

/* ───────────────────────────────
   Column
   ─────────────────────────────── */

export function useCreateTariffColumn() {
    const { mutate, isPending, error } = useTariffMutation(
        ({ groupId, tariffId, duration }: { groupId: string; tariffId: string; duration: number }) =>
            createTariffColumn(groupId, tariffId, duration),
        invalidateStructure,
    );
    return { createColumn: mutate, isPending, error };
}

export function useDeleteTariffColumn() {
    const { mutate, isPending, error } = useTariffMutation(
        ({ groupId, tariffId, columnId }: { groupId: string; tariffId: string; columnId: string }) =>
            deleteTariffColumn(groupId, tariffId, columnId),
        invalidateStructure,
    );
    return { deleteColumn: mutate, isPending, error };
}

export function useUpdateTariffColumn() {
    const { mutateAsync, isPending, error } = useTariffMutation(
        ({ groupId, tariffId, columnId, duration }: {
            groupId: string; tariffId: string; columnId: string; duration: number;
        }) => updateTariffColumn(groupId, tariffId, columnId, duration),
        invalidateStructure,
    );
    return { updateColumn: mutateAsync, isPending, error };
}

/* ───────────────────────────────
   Row
   ─────────────────────────────── */

export function useCreateTariffRow() {
    const { mutateAsync, isPending, error } = useTariffMutation(
        ({ groupId, tariffId, min_quantity, max_quantity }: {
            groupId: string; tariffId: string; min_quantity: number; max_quantity: number | null;
        }) => createTariffRow(groupId, tariffId, min_quantity, max_quantity),
        invalidateStructure,
    );
    return { createRow: mutateAsync, isPending, error };
}

export function useDeleteTariffRow() {
    const { mutate, isPending, error } = useTariffMutation(
        ({ groupId, tariffId, rowId }: { groupId: string; tariffId: string; rowId: string }) =>
            deleteTariffRow(groupId, tariffId, rowId),
        invalidateStructure,
    );
    return { deleteRow: mutate, isPending, error };
}

export function useUpdateTariffRow() {
    const { mutateAsync, isPending, error } = useTariffMutation(
        ({ groupId, tariffId, rowId, min_quantity, max_quantity }: {
            groupId: string; tariffId: string; rowId: string; min_quantity: number; max_quantity: number | null;
        }) => updateTariffRow(groupId, tariffId, rowId, min_quantity, max_quantity),
        invalidateStructure,
    );
    return { updateRow: mutateAsync, isPending, error };
}

/* ───────────────────────────────
   Cell
   ─────────────────────────────── */

export function useUpdateTariffCell() {
    const { mutateAsync, isPending, error } = useTariffMutation(
        ({ groupId, tariffId, cellId, default_price }: {
            groupId: string; tariffId: string; cellId: string; default_price: number;
        }) => updateTariffCell(groupId, tariffId, cellId, default_price),
        invalidateStructure,
    );
    return { updateCell: mutateAsync, isPending, error };
}
