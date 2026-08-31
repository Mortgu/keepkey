import {  useMutation, useQueryClient } from "@tanstack/react-query";
import { tariffKeys } from "./tariff-keys";
import {
    createStandardDuration,
    createStandardTier,
    createTariff,
    createTariffGroup,
    deleteStandardDuration,
    deleteStandardTier,
    deleteTariff,
    deleteTariffGroup,
    restoreTariffVersion,
    sealTariffVersion,
    updateStandardTier,
    updateTariffCell,
    updateTariffGroup,
} from "./tariff-api";
import type {QueryClient} from "@tanstack/react-query";
import type {
    CreateTariffGroupInput,
    CreateTariffInput,
    UpdateTariffGroupInput,
} from "@keepit/schemas";

/**
 * Strukturänderungen an Staffeln oder Zellen.
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
   Standardlaufzeiten
   ─────────────────────────────── */

/**
 * `tariffKeys.all`, weil die Liste unterhalb davon hängt — und weil sie in
 * Abschnitt 2 die Spaltenachse jeder Preistabelle wird.
 */
export function useCreateStandardDuration() {
    const { mutate, isPending, error } = useTariffMutation(
        (months: number) => createStandardDuration(months),
        invalidateAll,
    );
    return { createStandardDuration: mutate, isPending, error };
}

export function useDeleteStandardDuration() {
    const { mutate, isPending, error } = useTariffMutation(
        (id: string) => deleteStandardDuration(id),
        invalidateAll,
    );
    return { deleteStandardDuration: mutate, isPending, error };
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
   Standard-Mengenstaffeln — wirken auf jede Preistabelle
   ─────────────────────────────── */

export function useCreateStandardTier() {
    const { mutateAsync, isPending, error } = useTariffMutation(
        ({ min_quantity, max_quantity }: { min_quantity: number; max_quantity: number | null }) =>
            createStandardTier(min_quantity, max_quantity),
        invalidateAll,
    );
    return { createTier: mutateAsync, isPending, error };
}

export function useUpdateStandardTier() {
    const { mutateAsync, isPending, error } = useTariffMutation(
        ({ id, min_quantity, max_quantity }: { id: string; min_quantity: number; max_quantity: number | null }) =>
            updateStandardTier(id, min_quantity, max_quantity),
        invalidateAll,
    );
    return { updateTier: mutateAsync, isPending, error };
}

export function useDeleteStandardTier() {
    const { mutate, isPending, error } = useTariffMutation(
        (id: string) => deleteStandardTier(id),
        invalidateAll,
    );
    return { deleteTier: mutate, isPending, error };
}

/* ───────────────────────────────
   Zelle
   ─────────────────────────────── */

export function useUpdateTariffCell() {
    const { mutateAsync, isPending, error } = useTariffMutation(
        ({ groupId, tariffId, duration, min_quantity, default_price }: {
            groupId: string; tariffId: string; duration: number; min_quantity: number; default_price: number;
        }) => updateTariffCell(groupId, tariffId, duration, min_quantity, default_price),
        invalidateStructure,
    );
    return { updateCell: mutateAsync, isPending, error };
}
