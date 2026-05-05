import { forwardRef } from "react";
import { tv } from "tailwind-variants";
import type { SelectComponentProps } from "./select-types";

const styles = tv({
    base: [
        "w-full rounded-lg border border-(--border)",
        "transition-all duration-200",
        "px-3 text-base outline-none",
        "focus:bg-gray-100",
        "disabled:opacity-50 disabled:cursor-not-allowed",
    ],
    variants: {
        input_size: {
            xs: "h-[34px] px-3 text-xs font-light",
            sm: "h-[38px] px-3 text-sm font-normal",
            md: "h-[42px] px-3 text-md font-semibold",
        },
        error: {
            true: "border-red-500",
            false: "",
        },
    },
    defaultVariants: {
        input_size: "sm",
        error: false,
    },
});

export const Select = forwardRef<HTMLSelectElement, SelectComponentProps>(
    ({ className, variant, input_size, label, error, options, placeholder, children, ...rest }, ref) => (
        <div className="w-full">
            <div className="flex items-center justify-between">
                {label && (
                    <label className="block text-sm font-normal text-(--text-600) mb-1">
                        {label}
                    </label>
                )}
                {error && (
                    <label className="text-sm font-normal text-red-500 mb-1">
                        {error}
                    </label>
                )}
            </div>
            <select
                ref={ref}
                className={styles({ input_size, error: !!error, className })}
                {...rest}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
                {children}
            </select>
        </div>
    )
);

Select.displayName = "Select";
