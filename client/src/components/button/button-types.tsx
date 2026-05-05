import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonComponentProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'link';
    size?: 'xs' | 'sm' | 'md';
    active?: false | true,
    danger?: boolean;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    iconOnly?: boolean;
    loading?: boolean;
    children?: ReactNode;
}
