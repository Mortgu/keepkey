import { forwardRef } from "react";
import { tv } from "tailwind-variants";
import { Loader2 } from "lucide-react";
import type { InputComponentProps } from "./input-types";
import { Button } from "@/components/button/button";

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
    adornment: {
      none: "",
      icon: "pr-9",
      button: "pr-11",
    },
  },
  defaultVariants: {
    variant: "primary",
    input_size: "sm",
    error: false,
    adornment: "none",
  },
});

const adornmentButtonClass =
  "absolute right-1 top-1/2 -translate-y-1/2 h-[26px] w-7 rounded-md";

export const Input = forwardRef<HTMLInputElement, InputComponentProps>(
  (
    {
      className,
      variant,
      input_size,
      label,
      error,
      rightIcon,
      rightButton,
      loading,
      ...rest
    },
    ref,
  ) => {
    const adornment = loading || rightButton ? (loading ? "icon" : "button") : rightIcon ? "icon" : "none";

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
        <div className="relative">
          <input
            ref={ref}
            className={styles({
              variant,
              input_size,
              error: !!error,
              adornment,
              className,
            })}
            {...rest}
          />

          {loading && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex text-gray-400">
              <Loader2 size={16} className="animate-spin" />
            </span>
          )}

          {!loading && rightButton && (() => {
            const { icon, className: btnClassName, type, ...btnRest } = rightButton;
            return (
              <Button
                size="xs"
                type={type ?? "button"}
                {...btnRest}
                icon={icon}
                iconOnly
                className={`${adornmentButtonClass} ${btnClassName ?? ""}`.trim()}
              />
            );
          })()}

          {!loading && !rightButton && rightIcon && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex text-gray-500">
              {rightIcon}
            </span>
          )}
        </div>
      </div>
    );
  },
);

Input.displayName = "Input";
