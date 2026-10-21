import { useTranslation } from "react-i18next";
import type { SortOption } from "@/components/elements/sort-dropdown";
import type { TranslationKey } from "@/i18n";

/*
 * Die Sortier-Optionen der Listen, einmal für alle.
 *
 * Der Wert (`feld:richtung`) geht unverändert als `sort` an den Server; wo eine
 * Liste selbst sortiert, tut sie es über `sortItems` mit derselben Bedeutung.
 * Die Beschriftung ist ein Schlüssel und wird erst in `useSortOptions` übersetzt,
 * damit ein Sprachwechsel die Optionen neu beschriftet.
 */
const LABEL_KEYS = {
    "createdAt:desc": "common.sort.createdAtDesc",
    "createdAt:asc": "common.sort.createdAtAsc",
    "companyName:asc": "common.sort.nameAsc",
    "companyName:desc": "common.sort.nameDesc",
} as const satisfies Record<string, TranslationKey>;

export type SortValue = keyof typeof LABEL_KEYS;

/** Nach Anlagedatum, neuestes zuerst (Standard jeder Liste). */
export const DATE_SORTS = ["createdAt:desc", "createdAt:asc"] as const satisfies ReadonlyArray<SortValue>;

/** Datum wie {@link DATE_SORTS}, dazu Firmenname A–Z / Z–A. */
export const DATE_AND_NAME_SORTS = [
    ...DATE_SORTS,
    "companyName:asc",
    "companyName:desc",
] as const satisfies ReadonlyArray<SortValue>;

type SortField<TValue extends SortValue> = TValue extends `${infer F}:${string}` ? F : never;

/** Sortiert eine Kopie von `items` so, wie der Server es für `value` täte. */
export function sortItems<T extends Record<SortField<TValue>, string>, TValue extends SortValue>(
    items: ReadonlyArray<T>,
    value: TValue,
): Array<T> {
    const [field, direction] = value.split(":") as [SortField<TValue>, "asc" | "desc"];
    const sign = direction === "asc" ? 1 : -1;

    return [...items].sort((a, b) =>
        sign * a[field].localeCompare(b[field], undefined, { sensitivity: "base" }),
    );
}

/** Die Optionen für `SortDropdown`, beschriftet in der aktiven Sprache. */
export function useSortOptions(values: ReadonlyArray<SortValue>): Array<SortOption> {
    const { t } = useTranslation();
    return values.map((value) => ({ value, label: t(LABEL_KEYS[value]) }));
}
