import { forwardRef } from "react";
import { tv } from "tailwind-variants";
import type { InputComponentProps } from "./input-types";

const styles = tv({
  base: [
    "w-full rounded-lg border border-(--border) transition-all duration-200",
    "text-base outline-none focus:bg-gray-100",
    "placeholder:text-gray-400",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ],
  variants: {
    variant: {
      primary: "",
      secondary: "",
    },
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
    variant: "primary",
    input_size: "sm",
    error: false,
  },
});

export const Input = forwardRef<HTMLInputElement, InputComponentProps>(
  ({ className, variant, input_size, label, error, ...rest }, ref) => {
    return (
      <div className="w-full">
        <div className="flex flex-wrap items-center justify-between">
          {label && (
            <label className="block text-sm font-normal text-(--text-600) mb-1">
              {label}
            </label>
          )}

          {error && (
            <label className="text-sm font-normal text-red-500  mb-1">
              {error}
            </label>
          )}
        </div>
        <input ref={ref} className={styles({
          variant, input_size, error: !!error, className,
        })}
          {...rest}
        />
      </div>
    );
  },
);

Input.displayName = "Input";
