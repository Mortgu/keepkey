import type { InputHTMLAttributes } from "react";
import type { ComponentSize } from "@/components/size";

export interface CheckboxComponentProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
    error?: boolean;
    label?: string;
    size?: ComponentSize;
}