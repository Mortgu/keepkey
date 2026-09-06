import { AlertCircle, AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Error-/Warning-Badge neben dem Feld-Label. Der Tooltip erscheint bei Hover
 * und Tastaturfokus, damit die Begründung auch ohne Maus erreichbar ist.
 */
export function LabelBadge({
    kind,
    label,
    tooltip,
}: {
    kind: "error" | "warning";
    label: string;
    tooltip?: string;
}) {
    const isError = kind === "error";
    const colorClasses = isError
        ? "bg-(--destructive-subtle) text-(--destructive) border border-(--destructive-line)"
        : "bg-(--warning-subtle) text-(--warning) border border-(--warning-line)";
    const Icon = isError ? AlertCircle : AlertTriangle;

    return (
        <span
            className={cn(
                "relative group inline-flex items-center gap-1 px-1.5 py-px rounded-full",
                "text-[11px] font-medium leading-[1.4] cursor-help",
                colorClasses,
            )}
            tabIndex={0}
            role="button"
            aria-label={`${kind} details`}
        >
            <Icon size={11} strokeWidth={2.5} className="shrink-0" />
            {label}
            {tooltip && (
                <span
                    className={cn(
                        "absolute top-[calc(100%+6px)] left-0 z-10 min-w-55 max-w-xs",
                        "bg-(--text) text-(--text-inv) text-xs font-normal leading-[1.45]",
                        "px-2.5 py-2 rounded-md shadow-lg",
                        "opacity-0 -translate-y-0.5 pointer-events-none",
                        "transition-[opacity,transform] duration-120 ease-out",
                        "group-hover:opacity-100 group-hover:translate-y-0",
                        "group-focus:opacity-100 group-focus:translate-y-0",
                        "before:content-[''] before:absolute before:-top-1 before:left-3",
                        "before:w-2 before:h-2 before:bg-(--text) before:rotate-45",
                    )}
                >
                    {tooltip}
                </span>
            )}
        </span>
    );
}

export interface FieldProps {
    /**
     * Label über dem Feld. Als String wird ein `<label>` mit `htmlFor` gerendert;
     * ein ReactNode wird unverändert übernommen (z. B. die ScrubArea des
     * NumberField, die ihr eigenes `<label>` mitbringt).
     */
    label?: ReactNode;

    /** Kurzer Fehlertext als Badge neben dem Label. */
    error?: string;

    /** Längere Erklärung, erscheint als Tooltip am Fehler-Badge. */
    errorTooltip?: string;

    /** Kurzer Warntext als Badge. Wird nur gezeigt, wenn kein Fehler ansteht. */
    warning?: string;

    /** Längere Erklärung, erscheint als Tooltip am Warn-Badge. */
    warningTooltip?: string;

    /** Verknüpft das Label mit der Kontrolle. */
    htmlFor?: string;

    /** Auf den äußeren Container. */
    className?: string;

    /** Die eigentliche Kontrolle (Input, Select, Textarea …). */
    children: ReactNode;
}

/** Klassen des Feld-Labels — exportiert für Kontrollen mit eigenem Label-Aufbau. */
export const FIELD_LABEL_CLASS = "text-sm font-medium text-(--text)";

/**
 * Gemeinsamer Rahmen aller Feldkomponenten: Label-Zeile mit Error-/Warning-Badge,
 * darunter die Kontrolle.
 *
 * Input, Textarea, Select und NumberField rendern ihre Label-Zeile hierüber statt
 * selbst — damit ist die Anatomie per Konstruktion identisch statt per Disziplin.
 */
export function Field({
    label,
    error,
    errorTooltip,
    warning,
    warningTooltip,
    htmlFor,
    className,
    children,
}: FieldProps) {
    const hasHeader = label != null || error != null || warning != null;

    return (
        <div className={cn("w-full", className)}>
            {hasHeader && (
                <div className="mb-1 flex items-center justify-between gap-1.5">
                    {typeof label === "string" ? (
                        <label htmlFor={htmlFor} className={FIELD_LABEL_CLASS}>
                            {label}
                        </label>
                    ) : (
                        label
                    )}
                    {error ? (
                        <LabelBadge kind="error" label={error} tooltip={errorTooltip} />
                    ) : warning ? (
                        <LabelBadge kind="warning" label={warning} tooltip={warningTooltip} />
                    ) : null}
                </div>
            )}
            {children}
        </div>
    );
}
