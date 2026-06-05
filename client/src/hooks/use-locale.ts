import { useTranslation } from "react-i18next";
import type { Language } from "@/types";

/**
 * The active content language (DE/EN) derived from the i18next UI language.
 * This is the single source of truth for resolving translated content fields.
 */
export function useLocale(): Language {
  const { i18n } = useTranslation();
  return i18n.language?.toLowerCase().startsWith("de") ? "DE" : "EN";
}
