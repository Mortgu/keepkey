import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import type { ComponentSizes, ComponentVariants } from './base';
import { tv } from "tailwind-variants";

export const inputStyles = tv({
    slots: {
        wrapper: [
            'flex items-center justify-start',
            'border border-(--border) rounded-md'
        ],
        prefix: ['h-full flex items-center justify-center border-r border-(--border) aspect-square p-2'],
        input: [
            'w-full h-full outline-none',
            'px-2 text-sm'
        ],
    },
    variants: {
        size: {
            md: {
                wrapper: 'h-[44px]',
                input: 'text-[16px]'
            },
            sm: {
                wrapper: 'h-[38px]',
                input: 'text-[14px]'
            },
            xs: {
                wrapper: 'h-26',
                input: 'text-xs'
            },
        }
    },
    defaultVariants: {
        size: 'md',
    }
});

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
    size?: ComponentSizes;
    variant?: ComponentVariants;

    prefix?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const {
        className,
        size,
        variant,
        prefix,
    } = props;

    const styles = inputStyles({
        size: size,
    });

    return (
        <div ref={ref} className={styles.wrapper()}>
            <div className={styles.prefix()}>{prefix}</div>
            <input className={styles.input()} />
        </div>
    )
});

export default Input;