import { forwardRef } from "react";
import { tv } from "tailwind-variants";
import { Field } from "./field";
import { FIELD_BASE, FIELD_FOCUS, FIELD_PADDING, FIELD_STATE, fieldState } from "./tokens";
import type { TextareaHTMLAttributes } from "react";
import type { ComponentSize } from "./tokens";

export interface TextareaComponentProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
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
}

const styles = tv({
    // Kein CONTROL_HEIGHT: die Textarea wächst mit dem Inhalt.
    base: [FIELD_BASE, FIELD_FOCUS, "resize-y min-h-[70px] leading-[1.5]"],
    variants: {
        input_size: {
            xs: `${FIELD_PADDING.xs} py-2 text-[13px] font-light`,
            sm: `${FIELD_PADDING.sm} py-2 text-[14px] font-normal`,
            md: `${FIELD_PADDING.md} py-2 text-[16px] font-semibold`,
        },
        state: FIELD_STATE,
    },
    defaultVariants: {
        input_size: "sm",
        state: "none",
    },
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaComponentProps>(
    ({ className, size, label, error, errorTooltip, warning, warningTooltip, ...rest }, ref) => (
        <Field
            label={label}
            error={error}
            errorTooltip={errorTooltip}
            warning={warning}
            warningTooltip={warningTooltip}
            htmlFor={rest.id}
        >
            <textarea
                ref={ref}
                className={styles({ input_size: size, state: fieldState(error, warning), className })}
                {...rest}
            />
        </Field>
    ),
);

Textarea.displayName = "Textarea";
