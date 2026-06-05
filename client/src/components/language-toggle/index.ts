import type { LanguageOption } from './language-toggle-types';

/** Default DE / EN options matching the app's i18n setup. */
export const DEFAULT_LANGUAGE_OPTIONS: LanguageOption[] = [
    { code: "DE", label: 'Deutsch' },
    { code: "EN", label: 'English' },
];

export type { LanguageOption, LanguageToggleProps } from './language-toggle-types';
export { SegmentedLanguageToggle } from './segmented-language-toggle';
export { CompactLanguageToggle } from './compact-language-toggle';
export { UnderlineLanguageToggle } from './underline-language-toggle';
export { PillLanguageToggle } from './pill-language-toggle';
