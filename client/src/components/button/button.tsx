import {forwardRef} from 'react';
import {tv} from 'tailwind-variants';
import {Loader} from 'lucide-react';
import type {ButtonComponentProps} from './button-types';
import {SIZE_STYLES} from "@/components/size";

const styles = tv({
    base: [
        'w-fit cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg h-fit',
        'transition-all duration-200 outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed ',
    ],
    variants: {
        variant: {
            primary: [
                'bg-(--primary-600) text-white',
                'hover:opacity-90 active:opacity-80',
                'focus:ring-2 focus:ring-(--primary-400)',
            ],
            secondary: [
                'bg-white text-gray-900 border border-(--border)',
                'hover:bg-(--page-bg) active:bg-gray-300',
                'focus:ring-2 focus:ring-gray-300',
            ],
            ghost: [
                'bg-transparent text-gray-700',
                'hover:bg-gray-100 active:bg-gray-200',
                'focus:ring-2 focus:ring-gray-300',
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
            true: 'bg-red-600 text-white hover:opacity-90 active:opacity-80 focus:ring-2 focus:ring-red-200',
            false: ''
        },
        size: {
            fit_xs: 'h-fit p-0 w-fit text-xs',
            fit_sm: 'h-fit p-0 w-fit text-sm',
            fit_md: 'h-fit p-0 w-fit text-md',

            xs: `px-[12px] py-[5px] ${SIZE_STYLES.xs}`,
            sm: `px-[16px] py-[7px] ${SIZE_STYLES.sm}`,
            md: `px-[22px] py-[10px] ${SIZE_STYLES.md}`,
        },
        iconOnly: {
            true: 'aspect-square px-0',
            false: ''
        }
    },
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
        const resolvedIcon = loading ? <Loader className="size-4 animate-spin"/> : icon;
        return (
            <button
                ref={ref}
                className={styles({variant, size, active, danger, iconOnly, className})}
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