import type { Language } from "@/types";

type Translatable = { language: Language };

/**
 * Picks the translation matching `locale`, falling back to DE and then to the
 * first available translation. Returns undefined only if the list is empty.
 */
export function pickTranslation<T extends Translatable>(
  translations: T[] | undefined,
  locale: Language,
): T | undefined {
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
export function localized<T extends Translatable, K extends keyof T>(
  translations: T[] | undefined,
  locale: Language,
  field: K,
): T[K] | "" {
  return pickTranslation(translations, locale)?.[field] ?? "";
}
