import { forwardRef } from "react";
import { tv } from "tailwind-variants";
import type { SelectComponentProps } from "./select-types";
import { SIZE_STYLES } from "@/components/size";

const styles = tv({
    base: [
        "w-full rounded-lg border border-(--border)",
        "transition-all duration-200",
        "px-3 text-base outline-none",
        "focus:bg-gray-100",
        "disabled:opacity-50 disabled:cursor-not-allowed",
    ],
    variants: {
        size: {
            xs: `px-3 font-light ${SIZE_STYLES.xs}`,
            sm: `px-3 font-normal ${SIZE_STYLES.sm}`,
            md: `px-3 font-semibold ${SIZE_STYLES.md}`,
        },
        error: {
            true: "border-red-500",
            false: "",
        },
    },
    defaultVariants: {
        size: "sm",
        error: false,
    },
});

export const Select = forwardRef<HTMLSelectElement, SelectComponentProps>(
    ({ className, variant, size, label, error, options, placeholder, children, ...rest }, ref) => (
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
                className={styles({ size, error: !!error, className })}
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
