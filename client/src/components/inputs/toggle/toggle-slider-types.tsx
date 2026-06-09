import type { InputHTMLAttributes } from "react";
import type { ComponentSize } from "@/components/size";

export interface ToggleSliderComponentProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
    label?: string;
    size?: ComponentSize;
}