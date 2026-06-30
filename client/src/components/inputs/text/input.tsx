import { AlertCircle, AlertTriangle, Loader2 } from "lucide-react";
import { forwardRef } from "react";
import { tv } from "tailwind-variants";
import type { InputComponentProps } from "./input-types";
import { Button } from "@/components/button/button";

const styles = tv({
    base: [
        "w-full rounded-lg border border-(--border) bg-white transition-all duration-150",
        "text-sm text-(--text) outline-none",
        "placeholder:text-(--text-secondary)",
        "focus:border-(--primary) focus:shadow-[0_0_0_3px_rgba(0,104,63,0.15)]",
        "disabled:bg-(--subtle-50) disabled:text-(--text-secondary) disabled:cursor-not-allowed",
    ],
    variants: {
        input_size: {
            xs: "h-[34px] px-3 text-xs font-light",
            sm: "h-[38px] px-3 text-sm font-normal",
            md: "h-[42px] px-3 text-md font-semibold",
        },
        variant: {},
        state: {
            none: "",
            error: "border-(--destructive) focus:shadow-[0_0_0_3px_rgba(192,57,43,0.15)]",
            warning: "border-(--warning) focus:shadow-[0_0_0_3px_rgba(180,83,9,0.18)]",
        },
        adornment: {
            none: "",
            icon: "pr-9",
            button: "pr-11",
        },
    },
    defaultVariants: {
        input_size: "sm",
        state: "none",
        adornment: "none",
    },
});

const adornmentButtonClass =
    "absolute right-1 top-1/2 -translate-y-1/2 h-[29px] w-[29px] rounded-md";

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

export const Input = forwardRef<HTMLInputElement, InputComponentProps>(
    (
        {
            className,
            variant: _variant,
            size,
            label,
            error,
            errorTooltip,
            warning,
            warningTooltip,
            rightIcon,
            rightButton,
            loading,
            ...rest
        },
        ref,
    ) => {
        const state = error ? "error" : warning ? "warning" : "none";
        const adornment = loading || rightButton ? (loading ? "icon" : "button") : rightIcon ? "icon" : "none";

        return (
            <div className="w-full">
                {(label || error || warning) && (
                    <div className="flex items-center gap-1.5 mb-1 justify-between">
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
                <div className="relative">
                    <input
                        ref={ref}
                        className={styles({ input_size: size, state, adornment, className })}
                        {...rest}
                    />

                    {loading && (
                        <span
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex text-(--border-200)">
                            <Loader2 size={16} className="animate-spin border-t-(--primary)" />
                        </span>
                    )}

                    {!loading && rightButton && (() => {
                        const { icon, className: btnClassName, type, ...btnRest } = rightButton;
                        return (
                            <Button
                                size="xs"
                                type={type ?? "button"}
                                {...btnRest}
                                icon={icon}
                                iconOnly
                                className={`${adornmentButtonClass} ${btnClassName ?? ""}`.trim()}
                            />
                        );
                    })()}

                    {!loading && !rightButton && rightIcon && (
                        <span
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex text-(--text-secondary)">
                            {rightIcon}
                        </span>
                    )}
                </div>
            </div>
        );
    },
);

Input.displayName = "Input";
