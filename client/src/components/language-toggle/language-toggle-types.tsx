import type { Language } from "@/types";

export interface LanguageOption {
  /** Language code used as the value, e.g. "de" or "en". */
  code: Language;
  /** Full, human-readable label, e.g. "Deutsch". */
  label: string;
  /** Short code shown in the compact / pill variants. Defaults to `code.toUpperCase()`. */
  short?: string;
}

export interface LanguageToggleProps {
  /** Selectable languages. */
  options: Array<LanguageOption>;
  /** Currently active language code (controlled). */
  value: string;
  /** Called with the selected language code. */
  onChange: (code: Language) => void;
  className?: string;
  /** Accessible label for the underlying tablist. */
  "aria-label"?: string;
}
