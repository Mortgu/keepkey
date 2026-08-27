import { Loader2 } from "lucide-react";
import { forwardRef, useId } from "react";
import { tv } from "tailwind-variants";
import { Button } from "./button";
import { Field } from "./field";
import {
    CONTROL_HEIGHT,
    CONTROL_TEXT,
    FIELD_FOCUS_WITHIN,
    FIELD_GROUP_ADDON,
    FIELD_GROUP_BASE,
    FIELD_GROUP_INPUT,
    FIELD_PADDING,
    FIELD_STATE_WITHIN,
    fieldState,
} from "./tokens";
import type { ButtonComponentProps } from "./button";
import type { InputHTMLAttributes, ReactNode } from "react";
import type { ComponentSize } from "./tokens";

type InputAdornmentButton = Omit<ButtonComponentProps, "children" | "iconOnly" | "iconPosition" | "size">;

export interface InputComponentProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
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

    /**
     * Statischer Inhalt links im Feld, durch eine Trennlinie abgesetzt — Text,
     * Icon oder beides. Gedacht für Teile des Werts, die der Nutzer *nicht*
     * mittippen soll, z. B. `prefix="AG"` vor einer Angebotsnummer.
     */
    prefix?: ReactNode;

    /** Wie {@link InputComponentProps.prefix}, aber rechts im Feld. */
    suffix?: ReactNode;

    /** Decorative icon rendered on the right side of the input (non-interactive). */
    rightIcon?: ReactNode;

    /** Interactive button rendered on the right side of the input. Takes precedence over `rightIcon`. */
    rightButton?: InputAdornmentButton;

    /** When true, renders a spinning loader on the right side. Takes precedence over `rightButton` and `rightIcon`. */
    loading?: boolean;

    /** Klassen für den inneren `<input>` — `className` trifft die Gruppe (Rahmen). */
    inputClassName?: string;
}

/* Modul-privat: das Modul exportiert nur Komponenten (react-refresh). */
const inputStyles = tv({
    slots: {
        group: [FIELD_GROUP_BASE, FIELD_FOCUS_WITHIN],
        input: FIELD_GROUP_INPUT,
        addon: FIELD_GROUP_ADDON,
    },
    variants: {
        input_size: {
            xs: {
                group: CONTROL_HEIGHT.xs,
                input: `${FIELD_PADDING.xs} ${CONTROL_TEXT.xs} font-light`,
                addon: `${FIELD_PADDING.xs} ${CONTROL_TEXT.xs}`,
            },
            sm: {
                group: CONTROL_HEIGHT.sm,
                input: `${FIELD_PADDING.sm} ${CONTROL_TEXT.sm} font-normal`,
                addon: `${FIELD_PADDING.sm} ${CONTROL_TEXT.sm}`,
            },
            md: {
                group: CONTROL_HEIGHT.md,
                input: `${FIELD_PADDING.md} ${CONTROL_TEXT.md} font-semibold`,
                addon: `${FIELD_PADDING.md} ${CONTROL_TEXT.md}`,
            },
        },
        state: {
            none: {},
            error: { group: FIELD_STATE_WITHIN.error },
            warning: { group: FIELD_STATE_WITHIN.warning },
        },
        disabled: {
            true: { group: "bg-(--subtle-50) cursor-not-allowed" },
            false: {},
        },
    },
    defaultVariants: {
        input_size: "sm",
        state: "none",
        disabled: false,
    },
});

export const Input = forwardRef<HTMLInputElement, InputComponentProps>(
    (
        {
            className,
            inputClassName,
            size,
            label,
            error,
            errorTooltip,
            warning,
            warningTooltip,
            prefix,
            suffix,
            rightIcon,
            rightButton,
            loading,
            disabled,
            ...rest
        },
        ref,
    ) => {
        const state = fieldState(error, warning);
        const styles = inputStyles({ input_size: size, state, disabled: Boolean(disabled) });

        // Das Präfix ist Teil der Bedeutung des Felds ("AG" vor der Nummer), nicht
        // bloß Dekor — ohne diese Verknüpfung bliebe es für Screenreader unsichtbar.
        const generatedId = useId();
        const prefixId = `${rest.id ?? generatedId}-prefix`;

        return (
            <Field
                label={label}
                error={error}
                errorTooltip={errorTooltip}
                warning={warning}
                warningTooltip={warningTooltip}
                htmlFor={rest.id}
            >
                <div className={styles.group({ className })}>
                    {prefix != null && (
                        <span id={prefixId} className={styles.addon({ className: "border-r border-(--border)" })}>
                            {prefix}
                        </span>
                    )}

                    <input
                        ref={ref}
                        disabled={disabled}
                        aria-describedby={prefix != null ? prefixId : undefined}
                        className={styles.input({ className: inputClassName })}
                        {...rest}
                    />

                    {suffix != null && <span className={styles.addon()}>{suffix}</span>}

                    {loading && (
                        <span className={styles.addon({ className: "pl-0 text-(--border-200)" })}>
                            <Loader2 size={16} className="animate-spin border-t-(--primary)" />
                        </span>
                    )}

                    {!loading && rightButton && (() => {
                        const { icon, className: btnClassName, type, ...btnRest } = rightButton;
                        return (
                            <span className={styles.addon({ className: "pl-0" })}>
                                <Button
                                    size="xs"
                                    type={type ?? "button"}
                                    {...btnRest}
                                    icon={icon}
                                    iconOnly
                                    className={`h-[29px] w-[29px] rounded-md ${btnClassName ?? ""}`.trim()}
                                />
                            </span>
                        );
                    })()}

                    {!loading && !rightButton && rightIcon && (
                        <span className={styles.addon({ className: "pl-0" })}>{rightIcon}</span>
                    )}
                </div>
            </Field>
        );
    },
);

Input.displayName = "Input";
