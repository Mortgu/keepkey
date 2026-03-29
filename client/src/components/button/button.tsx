import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react';
import { tv } from 'tailwind-variants';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'link';
    size?: 'sm' | 'md' | 'lg';
    active?: false | true,
    children: ReactNode;
}

const styles = tv({
    base: [
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
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
        size: {
            sm: 'px-3 py-2 text-sm font-medium',
            md: 'px-4 py-3 text-base',
            lg: 'px-6 py-4 text-lg',
        }
    },
    defaultVariants: {
        variant: 'primary',
        size: 'md',
        active: false,
    }
});

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, children, ...rest }, ref) => {
        return (
            <button
                ref={ref}
                className={styles({ variant, size, className })}
                {...rest}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;