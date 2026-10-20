/** Intl setzt geschützte Leerzeichen (U+00A0, U+202F); für den Vergleich zählen sie als normale. */
export const plain = (s: string | null) => (s ?? "").replace(/[\u00A0\u202F]/g, " ");
