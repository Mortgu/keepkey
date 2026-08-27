/**
 * Zentrale Design-Token für alle Komponenten in diesem Ordner.
 *
 * Regel: Komponenten definieren Größen, Fokus und Zustandsfarben NICHT selbst,
 * sondern konsumieren, was hier steht. Farben kommen ausschließlich aus den
 * CSS-Variablen in `index.css` — keine Tailwind-Palette (`red-500`, `gray-300`),
 * keine `rgba()`/Hex-Literale.
 */

export type ComponentSize = "xs" | "sm" | "md";

export type ComponentVariant = "primary" | "secondary" | "border" | "ghost" | "link";

/**
 * Einheitliche Kontrollhöhe. Button, Input, Select, Textarea und NumberField
 * teilen sich diese Skala — nur so stehen sie nebeneinander bündig.
 */
export const CONTROL_HEIGHT = {
    xs: "h-[32px]",
    sm: "h-[38px]",
    md: "h-[44px]",
} as const satisfies Record<ComponentSize, string>;

/** Schriftgröße je Kontrollgröße. */
export const CONTROL_TEXT = {
    xs: "text-[13px]",
    sm: "text-[14px]",
    md: "text-[16px]",
} as const satisfies Record<ComponentSize, string>;

/** Horizontales Padding für Aktionsflächen — großzügiger als bei Feldern. */
export const ACTION_PADDING = {
    xs: "px-3.5",
    sm: "px-4",
    md: "px-4.5",
} as const satisfies Record<ComponentSize, string>;

/** Horizontales Padding für Eingabefelder. */
export const FIELD_PADDING = {
    xs: "px-3",
    sm: "px-3",
    md: "px-3.5",
} as const satisfies Record<ComponentSize, string>;

/** Vollständige Größenklasse für Aktionsflächen (Button, Tab). */
export const ACTION_SIZE = {
    xs: `${ACTION_PADDING.xs} ${CONTROL_HEIGHT.xs} ${CONTROL_TEXT.xs}`,
    sm: `${ACTION_PADDING.sm} ${CONTROL_HEIGHT.sm} ${CONTROL_TEXT.sm}`,
    md: `${ACTION_PADDING.md} ${CONTROL_HEIGHT.md} ${CONTROL_TEXT.md}`,
} as const satisfies Record<ComponentSize, string>;

/** Vollständige Größenklasse für Eingabefelder (Input, Select, NumberField). */
export const FIELD_SIZE = {
    xs: `${FIELD_PADDING.xs} ${CONTROL_HEIGHT.xs} ${CONTROL_TEXT.xs}`,
    sm: `${FIELD_PADDING.sm} ${CONTROL_HEIGHT.sm} ${CONTROL_TEXT.sm}`,
    md: `${FIELD_PADDING.md} ${CONTROL_HEIGHT.md} ${CONTROL_TEXT.md}`,
} as const satisfies Record<ComponentSize, string>;

/**
 * Gemeinsame Basis aller Eingabefelder: Rahmen, Hintergrund, Placeholder,
 * Disabled-Zustand. Die Größe kommt getrennt über {@link FIELD_SIZE} dazu.
 */
export const FIELD_BASE = [
    "w-full rounded-md border border-(--border) bg-white",
    "text-(--text) outline-none transition-all duration-150",
    "placeholder:text-(--text-secondary)",
    "disabled:bg-(--subtle-50) disabled:text-(--text-secondary) disabled:cursor-not-allowed",
].join(" ");

/**
 * Basis einer Feld-*Gruppe*: ein Container, der Rahmen und Hintergrund für einen
 * transparenten `<input>` darin trägt — nötig, sobald neben dem Eingabefeld noch
 * etwas im selben Rahmen sitzt (Addon, Stepper, Suffix). Genutzt von `Input` mit
 * `prefix`/`suffix` und von `NumberField`.
 *
 * Fokus und Zustand kommen getrennt über {@link FIELD_FOCUS_WITHIN} und
 * {@link FIELD_STATE_WITHIN} dazu, die Höhe über {@link CONTROL_HEIGHT}.
 */
export const FIELD_GROUP_BASE = [
    "flex w-full items-stretch overflow-hidden rounded-md border border-(--border) bg-white",
    "transition-all duration-150",
].join(" ");

/** Der transparente `<input>` innerhalb einer {@link FIELD_GROUP_BASE}. */
export const FIELD_GROUP_INPUT = [
    "h-full min-w-0 flex-1 bg-transparent text-(--text) outline-none",
    "placeholder:text-(--text-secondary)",
    "disabled:cursor-not-allowed disabled:text-(--text-secondary)",
].join(" ");

/** Statischer Inhalt neben dem Eingabefeld innerhalb einer {@link FIELD_GROUP_BASE}. */
export const FIELD_GROUP_ADDON =
    "flex shrink-0 items-center gap-1.5 text-(--text-secondary) select-none";

/** Fokus für Eingabefelder: Rahmen wechselt, Ring erscheint. */
export const FIELD_FOCUS = "focus:border-(--primary) focus:shadow-(--focus-ring)";

/**
 * Wie {@link FIELD_FOCUS}, aber für Container, die den Fokus eines Kindes
 * spiegeln — z. B. `NumberField.Group`, das den echten `<input>` umschließt.
 */
export const FIELD_FOCUS_WITHIN =
    "focus-within:border-(--primary) focus-within:shadow-(--focus-ring)";

/** Fokus für klickbare Flächen: Button, Stepper, Menüeintrag, Tab. */
export const ACTION_FOCUS =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)";

export type FieldState = "none" | "error" | "warning";

/** Rahmen + Fokusring je Feldzustand. */
export const FIELD_STATE = {
    none: "",
    error: "border-(--destructive) focus:shadow-(--focus-ring-destructive)",
    warning: "border-(--warning) focus:shadow-(--focus-ring-warning)",
} as const satisfies Record<FieldState, string>;

/** Wie {@link FIELD_STATE}, für Container mit `focus-within` (siehe FIELD_FOCUS_WITHIN). */
export const FIELD_STATE_WITHIN = {
    none: "",
    error: "border-(--destructive) focus-within:shadow-(--focus-ring-destructive)",
    warning: "border-(--warning) focus-within:shadow-(--focus-ring-warning)",
} as const satisfies Record<FieldState, string>;

/** Leitet den Feldzustand aus den Fehler-/Warntexten ab. */
export function fieldState(error?: string, warning?: string): FieldState {
    if (error) return "error";
    if (warning) return "warning";
    return "none";
}
