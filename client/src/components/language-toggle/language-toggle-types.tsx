import type { Language } from "@/types";
import type { ComponentSize } from "@/components/size";

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
  /** Controls the size of the toggle. Defaults to "sm". */
  size?: ComponentSize;
  /** Accessible label for the underlying tablist. */
  "aria-label"?: string;
}
