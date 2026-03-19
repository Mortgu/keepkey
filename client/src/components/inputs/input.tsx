import { type InputHTMLAttributes, forwardRef } from 'react';
import { tv } from 'tailwind-variants';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

const styles = tv({
    base: [
        'w-full px-4 py-3 rounded-lg border-2 transition-all duration-200',
        'text-base outline-none',
        'placeholder:text-gray-400',
        'disabled:opacity-50 disabled:cursor-not-allowed',
    ],
    variants: {
        error: {
            true: 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200',
            false: 'border-gray-300 focus:border-[var(--keepit-primary)] focus:ring-2 focus:ring-[var(--keepit-primary-25)]',
        }
    },
    defaultVariants: {
        error: false,
    }
});

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, ...rest }, ref) => {
        return (
            <input
                ref={ref}
                className={styles({ error, className })}
                {...rest}
            />
        );
    }
);

Input.displayName = 'Input';

export default Input;