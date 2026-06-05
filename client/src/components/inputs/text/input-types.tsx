import type { InputHTMLAttributes, ReactNode } from "react";
import type { ButtonComponentProps } from "@/components/button/button-types";

export type InputAdornmentButton = Omit<ButtonComponentProps, "children" | "iconOnly" | "iconPosition" | "size">;

export interface InputComponentProps extends InputHTMLAttributes<HTMLInputElement> {
    variant?: "primary" | "secondary";
    input_size?: "xs" | "sm" | "md";

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