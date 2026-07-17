import { forwardRef } from 'react';
import { tv } from 'tailwind-variants';
import { LoaderCircle } from 'lucide-react';
import type { ButtonComponentProps } from './button-types';
import { SIZE_STYLES } from '../size';

const styles = tv({
    base: [
        'w-fit h-fit cursor-pointer inline-flex items-center justify-center gap-2 rounded-md h-fit',
        'transition-all duration-200 outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed ',
    ],
    variants: {
        variant: {
            primary: [
                'bg-(--primary-600) text-white',
                'hover:opacity-90 active:opacity-80',
                'focus:ring-(--primary-400)',
            ],
            secondary: [
                'bg-(--page-bg)',
                'hover:bg-(--subtle-50) active:bg-gray-300',
                'focus:ring-gray-300',
            ],
            border: [
                'bg-white border border-(--border)',
                'hover:bg-(--page-bg)'
            ],
            ghost: [
                'bg-transparent text-gray-700',
                'hover:bg-gray-100 active:bg-gray-200',
                'focus:ring-gray-300',
            ],
            link: [
                'p-0',
                'bg-transparent text-gray-700 cursor-pointer',
                'hover:text-(--primary) active:text-(--primary)',
            ]
        },
        active: {
            true: [
                "bg-(--primary-600) text-white border-(--primary-600)",
                "hover:bg-(--primary-800)"
            ],
            false: ""
        },
        danger: {
            true: '',
            false: ''
        },
        size: {
            fit_xs: 'h-fit p-0 w-fit text-xs',
            fit_sm: 'h-fit p-0 w-fit text-sm',
            fit_md: 'h-fit p-0 w-fit text-md',

            md: SIZE_STYLES.md,
            sm: SIZE_STYLES.sm,
            xs: SIZE_STYLES.xs,
        },
        iconOnly: {
            true: 'aspect-square px-0',
            false: ''
        },
        focus: {
            true: 'focus:ring-2',
            false: ''
        }
    },
    compoundVariants: [
        {
            variant: "primary",
            danger: true,
            class: "bg-red-500 hover:bg-red-400"
        },
        {
            variant: 'border',
            danger: true,
            class: "border-red-500 text-red-500 hover:bg-red-100"
        },
        {
            variant: 'secondary',
            danger: true,
            class: "bg-red-100 text-red-800 hover:bg-red-200"
        }
    ],
    defaultVariants: {
        variant: 'primary',
        size: 'md',
        active: false,
        danger: false,
        iconOnly: false,
        focus: false,
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
        const resolvedIcon = loading ? <LoaderCircle className="size-4 animate-spin" /> : icon;
        return (
            <button
                ref={ref}
                className={styles({ variant, size, active, danger, iconOnly, className })}
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