import { Loader2 } from "lucide-react";
import { forwardRef } from "react";
import { tv } from "tailwind-variants";
import { Button } from "./button";
import { Field } from "./field";
import { FIELD_BASE, FIELD_FOCUS, FIELD_SIZE, FIELD_STATE, fieldState } from "./tokens";
import type { ButtonComponentProps } from "./button";
import type { InputHTMLAttributes, ReactNode } from "react";
import type { ComponentSize } from "./tokens";

type InputAdornmentButton = Omit<ButtonComponentProps, "children" | "iconOnly" | "iconPosition" | "size">;

export interface InputComponentProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
    size?: ComponentSize;

    /** Optional label text that will be rendered above the input element. */
    label?: string;

    /** Short error label shown as a badge next to the field label. Turns the input border red. */
    error?: string;

    /** Longer explanation shown in a tooltip when the error badge is hovered. */
    errorTooltip?: string;

    /** Short warning label shown as a badge next to the field label. Turns the input border amber. */
    warning?: string;

    /** Longer explanation shown in a tooltip when the warning badge is hovered. */
    warningTooltip?: string;

    /** Decorative icon rendered on the right side of the input (non-interactive). */
    rightIcon?: ReactNode;

    /** Interactive button rendered on the right side of the input. Takes precedence over `rightIcon`. */
    rightButton?: InputAdornmentButton;

    /** When true, renders a spinning loader on the right side. Takes precedence over `rightButton` and `rightIcon`. */
    loading?: boolean;
}

export const inputStyles = tv({
    base: [FIELD_BASE, FIELD_FOCUS],
    variants: {
        input_size: {
            xs: `${FIELD_SIZE.xs} font-light`,
            sm: `${FIELD_SIZE.sm} font-normal`,
            md: `${FIELD_SIZE.md} font-semibold`,
        },
        state: FIELD_STATE,
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

const adornmentButtonClass = "absolute right-1 top-1/2 -translate-y-1/2 h-[29px] w-[29px] rounded-md";

export const Input = forwardRef<HTMLInputElement, InputComponentProps>(
    (
        {
            className,
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
        const state = fieldState(error, warning);
        const adornment = loading ? "icon" : rightButton ? "button" : rightIcon ? "icon" : "none";

        return (
            <Field
                label={label}
                error={error}
                errorTooltip={errorTooltip}
                warning={warning}
                warningTooltip={warningTooltip}
                htmlFor={rest.id}
            >
                <div className="relative">
                    <input
                        ref={ref}
                        className={inputStyles({ input_size: size, state, adornment, className })}
                        {...rest}
                    />

                    {loading && (
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex text-(--border-200)">
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
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex text-(--text-secondary)">
                            {rightIcon}
                        </span>
                    )}
                </div>
            </Field>
        );
    },
);

Input.displayName = "Input";
