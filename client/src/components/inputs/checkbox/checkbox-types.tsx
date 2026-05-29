import type { InputHTMLAttributes } from "react";
import type { ComponentSize } from "@/components/size";

export interface CheckboxComponentProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
    label?: string;
    size?: ComponentSize;
}