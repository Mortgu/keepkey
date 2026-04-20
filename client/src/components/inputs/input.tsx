import { type InputHTMLAttributes, forwardRef } from 'react';
import { tv } from 'tailwind-variants';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    variant?: 'primary' | 'secondary';
    input_size?: 'xs' | 'sm' | 'md';
}

const styles = tv({
    base: [
        'w-full rounded-lg border border-gray-200 transition-all duration-200',
        'text-base outline-none focus:bg-gray-100',
        'placeholder:text-gray-400',
        'disabled:opacity-50 disabled:cursor-not-allowed',
    ],
    variants: {
        variant: {
            primary: '',
            secondary: ''
        },
        input_size: {
            xs: 'h-[34px] px-3 text-xs font-light',
            sm: 'h-[38px] px-3 text-sm font-normal',
            md: 'h-[42px] px-3 text-md font-semibold',
        }
    },
    defaultVariants: {
        variant: 'primary',
        input_size: 'sm',
    }
});

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, variant, input_size, ...rest }, ref) => {
        return (
            <input
                ref={ref}
                className={styles({ variant, input_size, className })}
                {...rest}
            />
        );
    }
);

Input.displayName = 'Input';

export default Input;