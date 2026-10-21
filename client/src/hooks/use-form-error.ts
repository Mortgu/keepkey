import { useTranslation } from "react-i18next";
import type { TranslationKey } from "@/i18n";
import { getFormError } from "@/lib/utils";

/** Interpolationswerte je Übersetzungsschlüssel einer Fehlermeldung. */
export type FormErrorParams = Partial<Record<TranslationKey, Record<string, unknown>>>;

/**
 * Liefert die erste Fehlermeldung eines Formularfelds in der aktiven Sprache.
 *
 * Zod-Schemas tragen als Meldung einen Übersetzungsschlüssel
 * (`"workloads.validation.productsRequired" satisfies TranslationKey`); er wird
 * erst hier, bei der Anzeige, aufgelöst — so folgt die Meldung einem
 * Sprachwechsel. Meldungen, die (noch) kein Schlüssel sind, bleiben unverändert.
 *
 * Braucht eine Meldung Werte (z. B. eine Längengrenze), liefert `params` sie je
 * Schlüssel: `{ "validation.passwordMin": { count: 8 } }`.
 *
 * Gibt eine Funktion statt eines Werts zurück, damit sie auch in Render-Props
 * (`form.Field children`) nutzbar ist, wo kein Hook aufgerufen werden darf.
 */
export function useFormError(params?: FormErrorParams): (errors: Array<unknown>) => string | undefined {
    const { t, i18n } = useTranslation();

    return (errors) => {
        const message = getFormError(errors);
        if (message === undefined || !i18n.exists(message)) return message;
        const key = message as TranslationKey;
        return t(key, params?.[key]);
    };
}
