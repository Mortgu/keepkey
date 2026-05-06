import type { ReactNode, SelectHTMLAttributes } from "react";

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectComponentProps extends SelectHTMLAttributes<HTMLSelectElement> {
    variant?: "primary";
    input_size?: "xs" | "sm" | "md";
    label?: string;
    error?: string;
    options?: SelectOption[];
    placeholder?: string;
    children?: ReactNode;
}