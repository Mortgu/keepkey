import type { TextareaHTMLAttributes } from "react";
import type { ComponentSize } from "@/components/size";

export interface TextareaComponentProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
    size?: ComponentSize;

    label?: string;

    error?: string;
    errorTooltip?: string;

    warning?: string;
    warningTooltip?: string;
}
