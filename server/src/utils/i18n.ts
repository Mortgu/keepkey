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

/**
 * Resolves a whole set of translated fields at once — the shape every
 * entity (position, flat rate, contract) actually needs its translation
 * in: several fields together, each falling back independently if the
 * picked translation is missing or doesn't carry that field.
 */
export function translateFields<T extends { language: Language }, F extends Record<string, unknown>>(
  translations: T[],
  language: Language,
  fallback: F,
): F {
  const translation = pickTranslation(translations, language);
  const result = {} as F;
  for (const key of Object.keys(fallback) as (keyof F)[]) {
    const value = translation?.[key as unknown as keyof T];
    result[key] = (value ?? fallback[key]) as F[keyof F];
  }
  return result;
}
