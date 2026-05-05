import type { InputHTMLAttributes } from "react";

export interface InputComponentProps extends InputHTMLAttributes<HTMLInputElement> {
    variant?: "primary" | "secondary";
    input_size?: "xs" | "sm" | "md";

    /** Optional label text that will be rendered above the input element. */
    label?: string;

    /** Optional error message. When supplied, the input border will turn red and the message will be shown below the input. */
    error?: string;
}