import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { ComponentSize } from "@/components/size";

export interface ButtonComponentProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'link' | 'border';
    size?: ComponentSize | 'fit_xs' | 'fit_sm' | 'fit_md';
    active?: false | true,
    danger?: boolean;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    iconOnly?: boolean;
    loading?: boolean;
    children?: ReactNode;
    focus?: boolean;
}
