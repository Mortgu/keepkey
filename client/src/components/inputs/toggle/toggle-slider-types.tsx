import type { InputHTMLAttributes } from "react";
import type { ComponentSize } from "@/components/size";

export interface ToggleSliderComponentProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    size?: ComponentSize;
}