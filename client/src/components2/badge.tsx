import { tv } from "tailwind-variants";
import type { ComponentSizes } from "./vars";
import type { HTMLAttributes } from "react";

export interface BadgeComponentProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'green' | 'blue' | 'red' | 'gray' | 'orange',
    size?: ComponentSizes,
    rounded?: boolean;
};

export const badgeStyle = tv({
    base: [
        'inline-flex items-center justify-center w-fit',
        'px-2.5 py-1 rounded-full font-normal'
    ],
    variants: {
        variant: {
            green: 'bg-[#E6F2EC] text-[#00683F]',
            blue: 'bg-[#FEF3C7] text-[#B45309]',
            red: 'bg-[#FDECEA] text-[#C0392B]',
            gray: 'bg-[#F0F4F1] text-[#4B5C52]',
            orange: 'bg-[#E1F0FA] text-[#1D6FA4]',
        },
        size: {
            md: 'text-[12px]',
            sm: 'text-[11px]',
            xs: 'text-[10px]'
        },
        rounded: {
            true: 'aspect-square px-0',
            false: ''
        }
    },
    defaultVariants: {
        variant: "gray",
        size: 'md',
        rouneded: false,
    }
});

export function Badge2({ variant, size, className, children, ...rest }: BadgeComponentProps) {
    return (
        <span className={badgeStyle({ variant, size, className })} {...rest}>
            {children}
        </span>
    )
}