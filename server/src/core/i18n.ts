import type { Language } from "@prisma/client";

/**
 * Picks the translation matching `language`, falling back to DE and then the
 * first available translation. Returns undefined only if the list is empty.
 */
export function pickTranslation<T extends { language: Language }>(
  translations: T[],
  language: Language = "DE",
): T | undefined {
  return (
    translations.find((t) => t.language === language) ??
    translations.find((t) => t.language === "DE") ??
    translations[0]
  );
}
