import {forwardRef} from "react";
import {tv} from "tailwind-variants";
import {ChevronDown} from "lucide-react";
import type {
    ButtonGroupProps,
    ButtonGroupSegmentProps,
    SegmentedButtonGroupProps,
    SplitButtonProps,
} from "./button-group-types";
import {cn} from "@/lib/utils";

const segmentStyles = tv({
    base: [
        "relative inline-flex items-center p-2 justify-center gap-2 font-medium outline-none transition-colors duration-130",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:text-(--fg-3)",
        "border border-(--border) text-(--text)",
        "ml-[-1px] first:ml-0",
    ],
    variants: {
        active: {
            true: "z-20 bg-white text-(--primary)",
            false: "z-10 bg-transparent bg-(--subtle-50) hover:bg-(--subtle)",
        },
        size: {
            xs: "h-[34px] min-w-[36px] px-2 text-xs",
            sm: "h-[38px] min-w-[38px] px-3 text-sm",
            md: "h-[42px] min-w-[42px] px-4 text-md",
        },
        iconOnly: {
            true: "aspect-square px-0",
            false: "",
        },
        first: {
            true: "rounded-l-sm",
            false: "",
        },
        last: {
            true: "rounded-r-sm",
            false: "",
        },
    },
    defaultVariants: {
        active: false,
        size: "md",
        iconOnly: false,
        first: false,
        last: false,
    },
});

export const ButtonGroupSegment = forwardRef<HTMLButtonElement, ButtonGroupSegmentProps>((props, ref) => {
    const {first, last, active, size = "md", icon, iconOnly, label, title, disabled, onClick} = props;

    return (
        <button ref={ref} type="button" title={title} disabled={disabled} onClick={onClick}
                className={segmentStyles({first, last, active, size, iconOnly})}>
            {icon && <span className="flex">{icon}</span>}
            {!iconOnly && label}
        </button>
    )
});

ButtonGroupSegment.displayName = "ButtonGroupSegment";

export function ButtonGroup({children, className}: ButtonGroupProps) {
    return (
        <div className={cn("inline-flex", className)} role="group">
            {children}
        </div>
    );
}

export function SegmentedButtonGroup<TValue extends string = string>(props: SegmentedButtonGroupProps<TValue>) {
    const {options, value, onChange, size, className} = props;

    return (
        <ButtonGroup className={className}>
            {options.map((option, i) => (
                <ButtonGroupSegment
                    key={option.value}
                    first={i === 0}
                    last={i === options.length - 1}
                    active={value === option.value}
                    size={size}
                    icon={option.icon}
                    iconOnly={option.iconOnly}
                    label={option.label}
                    title={option.title}
                    disabled={option.disabled}
                    onClick={() => onChange(option.value)}
                />
            ))}
        </ButtonGroup>
    );
}

const splitStyles = tv({
    base: [
        "inline-flex items-center justify-center gap-2 bg-(--fg-3) text-white font-medium",
        "hover:opacity-90 active:opacity-80 transition-opacity cursor-pointer",
        "disabled:opacity-50 disabled:cursor-not-allowed",
    ],
    variants: {
        position: {
            main: "rounded-l-sm",
            dropdown: "rounded-r-sm border-l border-(--border-inv)",
        },
        size: {
            sm: "h-[38px] px-4 text-sm",
            md: "h-[42px] px-6 text-md",
        },
    },
    defaultVariants: {
        position: "main",
        size: "md",
    },
});

export function SplitButton(props: SplitButtonProps) {
    const {label, icon, onClick, onDropdownClick, dropdownIcon, className, disabled} = props;

    return (
        <div className={cn("inline-flex", className)}>
            <button type="button" disabled={disabled} onClick={onClick}
                    className={splitStyles({position: "main"})}>
                {icon && <span className="flex">{icon}</span>}
                {label}
            </button>
            <button type="button" title="Optionen" disabled={disabled} onClick={onDropdownClick}
                    className={splitStyles({position: "dropdown"})}>
                {dropdownIcon ?? <ChevronDown className="size-3.25"/>}
            </button>
        </div>
    );
}