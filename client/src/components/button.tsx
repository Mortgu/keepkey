import { forwardRef } from 'react';
import { tv } from 'tailwind-variants';
import { LoaderCircle } from 'lucide-react';
import { ACTION_FOCUS, ACTION_ICON, ACTION_SIZE } from './tokens';
import type { ComponentSize, ComponentVariant } from './tokens';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonComponentProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ComponentVariant;
    size?: ComponentSize | 'fit_xs' | 'fit_sm' | 'fit_md';
    active?: boolean;
    danger?: boolean;
    /**
     * Die Icon-Größe kommt aus der Button-`size` — am Icon selbst muss nichts
     * gesetzt werden. Wer eine abweichende Größe braucht, setzt sie als Klasse:
     * `<Plus className="size-5" />` (siehe ACTION_ICON in tokens.ts).
     */
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    iconOnly?: boolean;
    loading?: boolean;
    children?: ReactNode;
}

export const buttonStyles = tv({
    base: [
        'loading-none',
        'w-fit cursor-pointer inline-flex items-center justify-center gap-2 rounded-md',
        'transition-all duration-200 font-medium',
        ACTION_FOCUS,
        'disabled:opacity-50 disabled:cursor-not-allowed',
    ],
    variants: {
        variant: {
            primary: [
                'bg-(--primary-600) text-(--text-inv)',
                'hover:opacity-90 active:opacity-80',
            ],
            secondary: [
                'bg-(--page-bg) text-(--text)',
                'hover:bg-(--subtle-50) active:bg-(--border-200)',
            ],
            border: [
                'bg-white border border-(--border) text-(--text)',
                'hover:bg-(--page-bg) active:bg-(--subtle-50)',
            ],
            ghost: [
                'bg-transparent text-(--text-600)',
                'hover:bg-(--subtle-50) active:bg-(--border)',
            ],
            link: [
                'p-0',
                'bg-transparent text-(--text-600)',
                'hover:text-(--primary) active:text-(--primary)',
            ]
        },
        active: {
            true: [
                "bg-(--primary-600) text-(--text-inv) border-(--primary-600)",
                "hover:bg-(--primary-800)"
            ],
            false: ""
        },
        danger: {
            true: '',
            false: ''
        },
        size: {
            fit_xs: `h-fit p-0 w-fit text-xs ${ACTION_ICON.xs}`,
            fit_sm: `h-fit p-0 w-fit text-sm ${ACTION_ICON.sm}`,
            fit_md: `h-fit p-0 w-fit text-md ${ACTION_ICON.md}`,

            md: `${ACTION_SIZE.md} ${ACTION_ICON.md}`,
            sm: `${ACTION_SIZE.sm} ${ACTION_ICON.sm}`,
            xs: `${ACTION_SIZE.xs} ${ACTION_ICON.xs}`,
        },
        iconOnly: {
            true: 'aspect-square px-0',
            false: ''
        },
    },
    compoundVariants: [
        {
            variant: "primary",
            danger: true,
            class: "bg-(--destructive) text-(--text-inv) hover:opacity-90"
        },
        {
            variant: 'border',
            danger: true,
            class: "border-(--destructive) text-(--destructive) hover:bg-(--destructive-subtle)"
        },
        {
            variant: 'secondary',
            danger: true,
            class: "bg-(--destructive-subtle) text-(--destructive) hover:bg-(--destructive-subtle) hover:opacity-80"
        }
    ],
    defaultVariants: {
        variant: 'primary',
        size: 'md',
        active: false,
        danger: false,
        iconOnly: false,
    }
});


export const Button = forwardRef<HTMLButtonElement, ButtonComponentProps>(
    ({
        className,
        variant,
        size,
        active,
        danger,
        icon,
        iconPosition = 'left',
        iconOnly,
        loading,
        children,
        ...rest
    }, ref) => {
        const resolvedIcon = loading ? <LoaderCircle className="animate-spin" /> : icon;
        return (
            <button
                ref={ref}
                className={buttonStyles({ variant, size, active, danger, iconOnly, className })}
                disabled={loading || rest.disabled}
                {...rest}
            >
                {iconPosition === 'left' && resolvedIcon}
                {!iconOnly && children}
                {iconPosition === 'right' && resolvedIcon}
            </button>
        );
    }
);

Button.displayName = 'Button';