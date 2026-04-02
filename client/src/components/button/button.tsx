import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react';
import { tv } from 'tailwind-variants';
import { Loader } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'link';
    size?: 'xs' | 'sm' | 'md';
    active?: false | true,
    danger?: boolean;
    icon?: ReactNode;
    iconOnly?: boolean;
    loading?: boolean;
    children?: ReactNode;
}

const styles = tv({
    base: [
        'w-fit cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg font-medium h-fit',
        'transition-all duration-200 outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed ',
    ],
    variants: {
        variant: {
            primary: [
                'bg-[var(--keepit-primary)] text-white',
                'hover:opacity-90 active:opacity-80',
                'focus:ring-2 focus:ring-[var(--keepit-primary-25)]',
            ],
            secondary: [
                'bg-gray-100 text-gray-900',
                'hover:bg-gray-200 active:bg-gray-300',
                'focus:ring-2 focus:ring-gray-300',
            ],
            ghost: [
                'bg-transparent text-gray-700',
                'hover:bg-gray-100 active:bg-gray-200',
                'focus:ring-2 focus:ring-gray-300',
            ],
            link: [
                'bg-transparent text-gray-700 cursor-pointer',
                'hover:text-(--keepit-primary) active:text-(--keepit-primary)',
                '',
            ]
        },
        active: {
            true: "text-(--keepit-primary)",
            false: ""
        },
        danger: {
            true: 'bg-red-600 text-white hover:opacity-90 active:opacity-80 focus:ring-2 focus:ring-red-200',
            false: ''
        },
        size: {
            xs: 'px-[0.5rem] py-[0.25rem] text-xs font-medium',
            sm: 'px-3 py-2 text-sm font-medium',
            md: 'px-4 py-3 text-base',
        },
        iconOnly: {
            true: 'aspect-square',
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

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, active, danger, icon, iconOnly, loading, children, ...rest }, ref) => {
        return (
            <button
                ref={ref}
                className={styles({ variant, size, active, danger, iconOnly, className })}
                disabled={loading || rest.disabled}
                {...rest}
            >
                {loading ? <Loader className="size-4 animate-spin" /> : icon}
                {!iconOnly && children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;