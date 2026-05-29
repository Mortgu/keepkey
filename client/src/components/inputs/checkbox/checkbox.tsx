import { forwardRef } from "react";
import { tv } from "tailwind-variants";
import type { CheckboxComponentProps } from "./checkbox-types";
import { SIZE_STYLES } from "@/components/size";

const checkboxSizes = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
} as const;

const styles = tv({
  base: [
    "aspect-squere rounded-md border border-(--border) cursor-pointer accent-[var(--primary)]",
    "transition-all duration-200 outline-none",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1",
  ],
  variants: {
    size: checkboxSizes,
    error: {
      true: "border-red-500 focus:border-red-600",
      false: "border-(--border) focus:border-[var(--primary)]",
    },
  },
  defaultVariants: {
    size: "sm",
    error: false,
  },
});

const labelStyles = tv({
  base: "font-medium text-gray-700 cursor-pointer",
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      md: "text-md",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

export const Checkbox = forwardRef<HTMLInputElement, CheckboxComponentProps>(
  ({ className, label, error = false, size, ...rest }, ref) => {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          type="checkbox"
          className={styles({ size, error, className })}
          {...rest}
        />
        {label && (
          <label
            htmlFor={rest.id}
            className={labelStyles({ size })}
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
