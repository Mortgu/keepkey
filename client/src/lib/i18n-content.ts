import type { Language } from "@keepit/schemas";

type Translatable = { language: Language };

/**
 * Picks the translation matching `locale`, falling back to DE and then to the
 * first available translation. Returns undefined only if the list is empty.
 */
export function pickTranslation<T extends Translatable>(translations: Array<T> | undefined, locale: Language): T | undefined {
    if (!translations?.length) return undefined;

    return (
        translations.find((t) => t.language === locale) ??
        translations.find((t) => t.language === "DE") ??
        translations[0]
    );
}

/**
 * Resolves a single localized field (e.g. `name`) for the active locale.
 * Returns an empty string when nothing matches so it is render-safe.
 */
export function localized<T extends Translatable, TKey extends keyof T>(translations: Array<T> | undefined, locale: Language, field: TKey): T[TKey] | "" {
    return pickTranslation(translations, locale)?.[field] ?? "";
}
