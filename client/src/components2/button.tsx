import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { tv } from "tailwind-variants";
import { type ComponentSizes, type ComponentVariants } from ".";
import { LoaderCircle } from "lucide-react";

export interface ButtonComponentProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ComponentVariants;
    size?: ComponentSizes;
    active?: boolean;
    danger?: boolean;
    icon?: ReactNode;
    iconPosition?: "left" | "right";
    iconOnly?: boolean;
    loading?: boolean;
    children?: ReactNode;
};

export const buttonStyles = tv({
    base: [
        'w-fit h-fit inline-flex items-center justify-center gap-2 rounded-md h-fit',
        'cursor-pointer transition-all duration-200 outline-none',
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
        size: {
            md: `px-4.5 h-[44px] text-[16px]`,
            sm: `px-4 h-[37.5px] text-[14px]`,
            xs: `px-3.5 h-[32px] text-[13px]`,
        },
        active: {
            true: "bg-(--primary-600) text-white border-(--primary-600) hover:bg-(--primary-800)",
            false: ""
        },
        danger: {
            true: 'bg-(--destructive) text-white',
            false: ''
        },
        iconOnly: {
            true: 'aspect-square px-0',
            false: '',
        }
    },
    compoundVariants: [
        {
            variant: "link",
            danger: true,
            className: 'text-(--destructive)'
        },
        {
            variant: 'border',
            danger: true,
            className: 'border-(--destructive) text-(--destructive)'
        },
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
    }
});

export const Button2 = forwardRef<HTMLButtonElement, ButtonComponentProps>(({ className, variant, size, active, danger, icon, iconOnly, iconPosition = 'left', loading, children, ...rest }, ref) => {
    const resolvedIcon = loading ? <LoaderCircle size={14} className="animate-spin" /> : icon;

    return (
        <button ref={ref} className={buttonStyles({ variant, size, active, danger, iconOnly, className })} disabled={loading || rest.disabled} {...rest}>
            {iconPosition === "left" && resolvedIcon}
            {!iconOnly && children}
            {iconPosition === "right" && resolvedIcon}
        </button>
    )
})
