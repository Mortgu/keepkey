import type { LanguageOption } from './language-toggle-types';

/** Default DE / EN options matching the app's i18n setup. */
export const DEFAULT_LANGUAGE_OPTIONS: Array<LanguageOption> = [
  { code: "DE", label: 'DE' },
  { code: "EN", label: 'EN' },
];

export type { LanguageOption, LanguageToggleProps } from './language-toggle-types';
export {
  SegmentedLanguageToggle,
  SegmentedToggle,
  type SegmentedToggleOption,
  type SegmentedToggleProps,
} from './segmented-toggle';
export { CompactLanguageToggle } from './compact-language-toggle';
export { UnderlineLanguageToggle } from './underline-language-toggle';
export { PillLanguageToggle } from './pill-language-toggle';
