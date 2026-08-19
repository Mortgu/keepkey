import { useId } from "react";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { Minus, MoveHorizontal, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { tv } from "tailwind-variants";
import { LabelBadge } from "./input";
import type { NumberFieldRootProps } from "@base-ui/react/number-field";
import type { ReactNode } from "react";
import type { ComponentSize } from "./tokens";

export interface NumberFieldComponentProps
    extends Omit<NumberFieldRootProps, "className" | "render" | "children"> {
    size?: ComponentSize;

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
            "flex w-full items-stretch overflow-hidden rounded-md border border-(--border) bg-white",
            "transition-all duration-150",
            "focus-within:border-(--primary) focus-within:shadow-[0_0_0_3px_rgba(0,104,63,0.15)]",
            "data-disabled:bg-(--subtle-50) data-disabled:cursor-not-allowed",
        ],
        input: [
            "h-full min-w-0 flex-1 bg-transparent px-3 text-(--text) tabular-nums outline-none",
            "placeholder:text-(--text-secondary)",
            "data-disabled:cursor-not-allowed data-disabled:text-(--text-secondary)",
        ],
        stepper: [
            "flex shrink-0 cursor-pointer items-center justify-center select-none",
            "border-(--border) text-(--text-600) transition-colors duration-100",
            "hover:not-data-disabled:bg-(--subtle-50) active:not-data-disabled:bg-(--border)",
            "focus-visible:z-1 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--primary)",
            "data-disabled:cursor-not-allowed data-disabled:text-(--text-secondary)",
            "disabled:cursor-not-allowed disabled:text-(--text-secondary) disabled:hover:bg-transparent",
        ],
        suffix: "flex shrink-0 items-center pr-3 pl-1 text-(--text-secondary) select-none",
    },
    variants: {
        input_size: {
            xs: {
                group: "h-[34px]",
                input: "text-xs font-light",
                stepper: "w-8",
                suffix: "text-xs",
            },
            sm: {
                group: "h-[38px]",
                input: "text-sm font-normal",
                stepper: "w-9",
                suffix: "text-sm",
            },
            md: {
                group: "h-[42px]",
                input: "text-md font-semibold",
                stepper: "w-10",
                suffix: "text-md",
            },
        },
        state: {
            none: {},
            error: {
                group: "border-(--destructive) focus-within:shadow-[0_0_0_3px_rgba(192,57,43,0.15)]",
            },
            warning: {
                group: "border-(--warning) focus-within:shadow-[0_0_0_3px_rgba(180,83,9,0.18)]",
            },
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
    ...rest
}: NumberFieldComponentProps) {
    const { t, i18n } = useTranslation();
    const generatedId = useId();
    const inputId = id ?? generatedId;

    const state = error ? "error" : warning ? "warning" : "none";
    const styles = numberFieldStyles({ input_size: size, state });

    const labelNode = label ? (
        <label
            htmlFor={inputId}
            className={`text-sm font-medium text-(--text) ${scrubbable ? "cursor-ew-resize" : ""}`}
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
            {(label || error || warning) && (
                <div className="mb-1 flex items-center justify-between gap-1.5">
                    {scrubbable && labelNode ? (
                        <BaseNumberField.ScrubArea className="cursor-ew-resize select-none">
                            {labelNode}
                            <BaseNumberField.ScrubAreaCursor className="drop-shadow-[0_1px_1px_#0008] filter">
                                <MoveHorizontal size={20} className="text-(--text)" />
                            </BaseNumberField.ScrubAreaCursor>
                        </BaseNumberField.ScrubArea>
                    ) : (
                        labelNode
                    )}
                    {error && <LabelBadge kind="error" label={error} tooltip={errorTooltip} />}
                    {!error && warning && (
                        <LabelBadge kind="warning" label={warning} tooltip={warningTooltip} />
                    )}
                </div>
            )}

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
        </BaseNumberField.Root>
    );
}
