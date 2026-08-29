import { useId } from "react";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { Minus, MoveHorizontal, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { tv } from "tailwind-variants";
import { FIELD_LABEL_CLASS, Field } from "./field";
import { selectOnFocus } from "./select-on-focus";
import { ACTION_FOCUS, CONTROL_HEIGHT, CONTROL_TEXT, FIELD_FOCUS_WITHIN, FIELD_GROUP_ADDON, FIELD_GROUP_BASE, FIELD_GROUP_INPUT, FIELD_STATE_WITHIN, fieldState } from "./tokens";
import type { NumberFieldRootProps } from "@base-ui/react/number-field";
import type { FocusEventHandler, ReactNode } from "react";
import type { ComponentSize } from "./tokens";

/* `NumberFieldRootProps` erbt die `<div>`-Attribute des Wrappers — Fokus, Blur und
   Autofocus gehörten damit dem Gruppen-Container statt dem Eingabefeld. Sie werden
   hier herausgenommen und weiter unten gezielt an `NumberField.Input` gereicht. */
export interface NumberFieldComponentProps
    extends Omit<NumberFieldRootProps, "className" | "render" | "children" | "onFocus" | "onBlur" | "autoFocus"> {
    size?: ComponentSize;

    /** Fokussiert das Eingabefeld beim Mounten — z. B. für Inline-Editoren im Tarif-Grid. */
    autoFocus?: boolean;

    /** Läuft auf dem `<input>`, nachdem dessen Wert markiert wurde. */
    onFocus?: FocusEventHandler<HTMLInputElement>;

    /** Läuft auf dem `<input>`, nicht auf der Feldgruppe. */
    onBlur?: FocusEventHandler<HTMLInputElement>;

    /** Optional label text rendered above the field. */
    label?: string;

    /** Short error label shown as a badge next to the field label. Turns the border red. */
    error?: string;

    /** Longer explanation shown in a tooltip when the error badge is hovered. */
    errorTooltip?: string;

    /** Short warning label shown as a badge next to the field label. Turns the border amber. */
    warning?: string;

    /** Longer explanation shown in a tooltip when the warning badge is hovered. */
    warningTooltip?: string;

    placeholder?: string;

    /** Static text or icon rendered inside the field after the value, e.g. "€" or "Stk.". */
    suffix?: ReactNode;

    /** Renders the field without the -/+ stepper buttons. */
    hideSteppers?: boolean;

    /** Lets the user drag the label horizontally to change the value. Requires `label`. */
    scrubbable?: boolean;

    /** Applied to the field group (border box). */
    className?: string;

    /** Applied to the inner `<input>`. */
    inputClassName?: string;
}

const numberFieldStyles = tv({
    slots: {
        group: [
            FIELD_GROUP_BASE,
            FIELD_FOCUS_WITHIN,
            "data-disabled:bg-(--subtle-50) data-disabled:cursor-not-allowed",
        ],
        input: [
            FIELD_GROUP_INPUT,
            "px-3 tabular-nums",
            "data-disabled:cursor-not-allowed data-disabled:text-(--text-secondary)",
        ],
        stepper: [
            "flex shrink-0 cursor-pointer items-center justify-center select-none",
            "border-(--border) text-(--text-600) transition-colors duration-100",
            "hover:not-data-disabled:bg-(--subtle-50) active:not-data-disabled:bg-(--border)",
            `focus-visible:z-1 ${ACTION_FOCUS}`,
            "data-disabled:cursor-not-allowed data-disabled:text-(--text-secondary)",
            "disabled:cursor-not-allowed disabled:text-(--text-secondary) disabled:hover:bg-transparent",
        ],
        suffix: [FIELD_GROUP_ADDON, "pr-3 pl-1"],
    },
    variants: {
        input_size: {
            xs: {
                group: CONTROL_HEIGHT.xs,
                input: `${CONTROL_TEXT.xs} font-light`,
                stepper: "w-8",
                suffix: CONTROL_TEXT.xs,
            },
            sm: {
                group: CONTROL_HEIGHT.sm,
                input: `${CONTROL_TEXT.sm} font-normal`,
                stepper: "w-9",
                suffix: CONTROL_TEXT.sm,
            },
            md: {
                group: CONTROL_HEIGHT.md,
                input: `${CONTROL_TEXT.md} font-semibold`,
                stepper: "w-10",
                suffix: CONTROL_TEXT.md,
            },
        },
        state: {
            none: {},
            error: { group: FIELD_STATE_WITHIN.error },
            warning: { group: FIELD_STATE_WITHIN.warning },
        },
    },
    defaultVariants: {
        input_size: "sm",
        state: "none",
    },
});

export function NumberField({
    size,
    label,
    error,
    errorTooltip,
    warning,
    warningTooltip,
    placeholder,
    suffix,
    hideSteppers = false,
    scrubbable = false,
    className,
    inputClassName,
    id,
    locale,
    autoFocus,
    onFocus,
    onBlur,
    ...rest
}: NumberFieldComponentProps) {
    const { t, i18n } = useTranslation();
    const generatedId = useId();
    const inputId = id ?? generatedId;

    const state = fieldState(error, warning);
    const styles = numberFieldStyles({ input_size: size, state });

    const labelNode = label ? (
        <label
            htmlFor={inputId}
            className={`${FIELD_LABEL_CLASS} ${scrubbable ? "cursor-ew-resize" : ""}`}
        >
            {label}
        </label>
    ) : null;

    return (
        <BaseNumberField.Root
            id={inputId}
            // Formatting follows the active UI language (de → "1.234,56").
            locale={locale ?? i18n.language}
            className="w-full"
            {...rest}
        >
            <Field
                label={
                    scrubbable && labelNode ? (
                        <BaseNumberField.ScrubArea className="cursor-ew-resize select-none">
                            {labelNode}
                            <BaseNumberField.ScrubAreaCursor className="drop-shadow-(--shadow-thumb) filter">
                                <MoveHorizontal size={20} className="text-(--text)" />
                            </BaseNumberField.ScrubAreaCursor>
                        </BaseNumberField.ScrubArea>
                    ) : (
                        labelNode
                    )
                }
                error={error}
                errorTooltip={errorTooltip}
                warning={warning}
                warningTooltip={warningTooltip}
            >
                <BaseNumberField.Group className={styles.group({ className })}>
                    {!hideSteppers && (
                        <BaseNumberField.Decrement
                            className={styles.stepper({ className: "border-r" })}
                            aria-label={t("common.decrement")}
                        >
                            <Minus size={15} />
                        </BaseNumberField.Decrement>
                    )}

                    <BaseNumberField.Input
                        placeholder={placeholder}
                        className={styles.input({ className: inputClassName })}
                        autoFocus={autoFocus}
                        onBlur={onBlur}
                        onFocus={(event) => {
                            selectOnFocus(event);
                            onFocus?.(event);
                        }}
                    />

                    {suffix && <span className={styles.suffix()}>{suffix}</span>}

                    {!hideSteppers && (
                        <BaseNumberField.Increment
                            className={styles.stepper({ className: "border-l" })}
                            aria-label={t("common.increment")}
                        >
                            <Plus size={15} />
                        </BaseNumberField.Increment>
                    )}
                </BaseNumberField.Group>
            </Field>
        </BaseNumberField.Root>
    );
}
