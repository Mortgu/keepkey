import {Button} from "@/components/button/button";
import {AlertCircle, AlertTriangle, Loader2} from "lucide-react";
import {forwardRef} from "react";
import {tv} from "tailwind-variants";
import type {InputComponentProps} from "./input-types";
import {SIZE_STYLES} from "@/components/size";

const styles = tv({
    base: [
        "w-full rounded-lg border border-(--border) bg-white transition-all duration-150",
        "text-sm text-(--text) outline-none",
        "placeholder:text-(--text-secondary)",
        "focus:border-(--primary) focus:shadow-[0_0_0_3px_rgba(0,104,63,0.15)]",
        "disabled:bg-(--subtle-50) disabled:text-(--text-secondary) disabled:cursor-not-allowed",
    ],
    variants: {
        size: {
            xs: `px-3 font-light ${SIZE_STYLES.xs}`,
            sm: `px-3 font-normal ${SIZE_STYLES.sm}`,
            md: `px-3 font-semibold ${SIZE_STYLES.md}`,
        },
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
        size: "sm",
        state: "none",
        adornment: "none",
    },
});

const adornmentButtonClass =
    "absolute right-1 top-1/2 -translate-y-1/2 h-[26px] w-7 rounded-md";

type LabelBadgeProps = {
    kind: "error" | "warning";
    label: string;
    tooltip?: string;
}

function LabelBadge({kind, label, tooltip}: LabelBadgeProps) {
    const isError = kind === "error";
    const Icon = isError ? AlertCircle : AlertTriangle;

    const badgeStyles = tv({
        base: [
            "flex items-center justify-between",
            "relative group inline-flex gap-1",
            "px-1.5 py-px rounded-full leading-[1.4]",
            "font-medium text-[11px] cursor-help"
        ],
        variants: {
            kind: {
                error: "bg-(--destructive-subtle) text-red-800 border border-red-200",
                warning: "bg-(--warning-subtle) text-amber-800 border border-amber-200",
            }
        }
    })

    return (
        <span className={badgeStyles({kind: kind})} tabIndex={0} role="button" aria-label={`${kind} details`}>
            <Icon size={11} strokeWidth={2.5} className="shrink-0"/>

            {label}

            {tooltip && (
                <span className={[
                    "w-fit absolute top-[calc(100%+6px)] left-0 z-10",
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
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                        {label && (
                            <label className="text-sm font-medium text-(--text)">
                                {label}
                            </label>
                        )}
                        {error && (
                            <LabelBadge kind="error" label={error} tooltip={errorTooltip}/>
                        )}
                        {!error && warning && (
                            <LabelBadge kind="warning" label={warning} tooltip={warningTooltip}/>
                        )}
                    </div>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        className={styles({size, state, adornment, className})}
                        {...rest}
                    />

                    {loading && (
                        <span
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex text-(--border-200)">
              <Loader2 size={16} className="animate-spin border-t-(--primary)"/>
            </span>
                    )}

                    {!loading && rightButton && (() => {
                        const {icon, className: btnClassName, type, ...btnRest} = rightButton;
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
