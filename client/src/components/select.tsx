import { forwardRef } from "react";
import { tv } from "tailwind-variants";
import { Field } from "./field";
import { FIELD_BASE, FIELD_FOCUS, FIELD_SIZE, FIELD_STATE, fieldState } from "./tokens";
import type { ComponentSize } from "./tokens";
import type { ReactNode, SelectHTMLAttributes } from "react";

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectComponentProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
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

    /** Renders the options; alternatively pass `<option>` elements as children. */
    options?: Array<SelectOption>;

    /** Shown as a disabled first entry while no value is selected. */
    placeholder?: string;

    children?: ReactNode;
}

const styles = tv({
    base: [FIELD_BASE, FIELD_FOCUS],
    variants: {
        input_size: {
            xs: `${FIELD_SIZE.xs} font-light`,
            sm: `${FIELD_SIZE.sm} font-normal`,
            md: `${FIELD_SIZE.md} font-semibold`,
        },
        state: FIELD_STATE,
    },
    defaultVariants: {
        input_size: "sm",
        state: "none",
    },
});

export const Select = forwardRef<HTMLSelectElement, SelectComponentProps>(
    (
        {
            className,
            size,
            label,
            error,
            errorTooltip,
            warning,
            warningTooltip,
            options,
            placeholder,
            children,
            ...rest
        },
        ref,
    ) => (
        <Field
            label={label}
            error={error}
            errorTooltip={errorTooltip}
            warning={warning}
            warningTooltip={warningTooltip}
            htmlFor={rest.id}
        >
            <select
                ref={ref}
                className={styles({ input_size: size, state: fieldState(error, warning), className })}
                {...rest}
            >
                {/* Nicht `disabled`: FieldSelect bindet leere Werte auf "", die
                    Platzhalter-Option ist dann die ausgewählte. Sie zu sperren
                    würde das Zurücksetzen einer Auswahl verhindern. */}
                {placeholder && <option value="">{placeholder}</option>}
                {options?.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
                {children}
            </select>
        </Field>
    ),
);

Select.displayName = "Select";
