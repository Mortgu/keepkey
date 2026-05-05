import { forwardRef } from "react";
import { tv } from "tailwind-variants";
import type { CheckboxComponentProps } from "./checkbox-types";

const styles = tv({
  base: [
    "w-4 h-4 aspect-squere rounded-md border border-(--border) cursor-pointer accent-[var(--primary)]",
    "transition-all duration-200 outline-none",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1",
  ],
  variants: {
    error: {
      true: "border-red-500 focus:border-red-600",
      false: "border-(--border) focus:border-[var(--primary)]",
    },
  },
  defaultVariants: {
    error: false,
  },
});

export const Checkbox = forwardRef<HTMLInputElement, CheckboxComponentProps>(
  ({ className, label, error = false, ...rest }, ref) => {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          type="checkbox"
          className={styles({ error, className })}
          {...rest}
        />
        {label && (
          <label
            htmlFor={rest.id}
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
