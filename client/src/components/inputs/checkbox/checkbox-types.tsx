import type { InputHTMLAttributes } from "react";

export interface CheckboxComponentProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
    label?: string;
}