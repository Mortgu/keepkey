import type { InputHTMLAttributes, ReactNode } from "react";
import type { ButtonComponentProps } from "@/components/button/button-types";

export type InputAdornmentButton = Omit<ButtonComponentProps, "children" | "iconOnly" | "iconPosition" | "size">;

export interface InputComponentProps extends InputHTMLAttributes<HTMLInputElement> {
    variant?: "primary" | "secondary";
    input_size?: "xs" | "sm" | "md";

    /** Optional label text that will be rendered above the input element. */
    label?: string;

    /** Optional error message. When supplied, the input border will turn red and the message will be shown below the input. */
    error?: string;

    /** Decorative icon rendered on the right side of the input (non-interactive). */
    rightIcon?: ReactNode;

    /** Interactive button rendered on the right side of the input. Takes precedence over `rightIcon`. */
    rightButton?: InputAdornmentButton;
}