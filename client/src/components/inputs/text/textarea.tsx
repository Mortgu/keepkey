import { AlertCircle, AlertTriangle } from "lucide-react";
import { forwardRef } from "react";
import { tv } from "tailwind-variants";
import type { TextareaComponentProps } from "./textarea-types";

const styles = tv({
    base: [
        "w-full rounded-lg border border-(--border) bg-white transition-all duration-150",
        "text-sm text-(--text) outline-none resize-y min-h-[70px] leading-[1.5]",
        "placeholder:text-(--text-secondary)",
        "focus:border-(--primary) focus:shadow-[0_0_0_3px_rgba(0,104,63,0.15)]",
        "disabled:bg-(--subtle-50) disabled:text-(--text-secondary) disabled:cursor-not-allowed",
    ],
    variants: {
        input_size: {
            xs: "px-3 py-2 text-xs font-light",
            sm: "px-3 py-2 text-sm font-normal",
            md: "px-3 py-2 text-md font-semibold",
        },
        state: {
            none: "",
            error: "border-(--destructive) focus:shadow-[0_0_0_3px_rgba(192,57,43,0.15)]",
            warning: "border-(--warning) focus:shadow-[0_0_0_3px_rgba(180,83,9,0.18)]",
        },
    },
    defaultVariants: {
        input_size: "sm",
        state: "none",
    },
});

function LabelBadge({
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
        ? "bg-(--destructive-subtle) text-red-800 border border-red-200"
        : "bg-(--warning-subtle) text-amber-800 border border-amber-200";
    const Icon = isError ? AlertCircle : AlertTriangle;

    return (
        <span
            className={`relative group inline-flex items-center gap-1 px-1.5 py-px rounded-full text-[11px] font-medium leading-[1.4] cursor-help ${colorClasses}`}
            tabIndex={0}
            role="button"
            aria-label={`${kind} details`}
        >
            <Icon size={11} strokeWidth={2.5} className="shrink-0" />
            {label}
            {tooltip && (
                <span
                    className={[
                        "absolute top-[calc(100%+6px)] left-0 z-10",
                        "min-w-55 max-w-xs",
                        "bg-(--text) text-white text-xs font-normal leading-[1.45]",
                        "px-2.5 py-2 rounded-md shadow-lg",
                        "opacity-0 -translate-y-0.5 pointer-events-none",
                        "transition-[opacity,transform] duration-120 ease-out",
                        "group-hover:opacity-100 group-hover:translate-y-0",
                        "group-focus:opacity-100 group-focus:translate-y-0",
                        "before:content-[''] before:absolute before:-top-1 before:left-3",
                        "before:w-2 before:h-2 before:bg-(--text) before:rotate-45",
                    ].join(" ")}
                >
                    {tooltip}
                </span>
            )}
        </span>
    );
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaComponentProps>(
    ({ className, size, label, error, errorTooltip, warning, warningTooltip, ...rest }, ref) => {
        const state = error ? "error" : warning ? "warning" : "none";

        return (
            <div className="w-full">
                {(label || error || warning) && (
                    <div className="flex items-center gap-1.5 mb-1">
                        {label && (
                            <label className="text-sm font-medium text-(--text)">
                                {label}
                            </label>
                        )}
                        {error && (
                            <LabelBadge kind="error" label={error} tooltip={errorTooltip} />
                        )}
                        {!error && warning && (
                            <LabelBadge kind="warning" label={warning} tooltip={warningTooltip} />
                        )}
                    </div>
                )}
                <textarea
                    ref={ref}
                    className={styles({ input_size: size, state, className })}
                    {...rest}
                />
            </div>
        );
    },
);

Textarea.displayName = "Textarea";
