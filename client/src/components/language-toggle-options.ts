/* ──────────────────────────────────────────────────────────────────────
   LanguageToggle types + default options. Kept out of language-toggle.tsx
   so that module only exports React components — required by react-refresh.
   ────────────────────────────────────────────────────────────────────── */

import type { Language } from "@keepit/schemas";
import type { ComponentSize } from "./tokens";

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

/** Default DE / EN options matching the app's i18n setup. */
export const DEFAULT_LANGUAGE_OPTIONS: Array<LanguageOption> = [
  { code: "DE", label: 'DE' },
  { code: "EN", label: 'EN' },
];
