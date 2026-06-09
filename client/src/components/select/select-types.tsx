import type { ReactNode, SelectHTMLAttributes } from "react";
import type { ComponentSize } from "@/components/size";

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectComponentProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
    variant?: "primary";
    size?: ComponentSize;
    label?: string;
    error?: string;
    options?: SelectOption[];
    placeholder?: string;
    children?: ReactNode;
}