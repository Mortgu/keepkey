import { forwardRef } from "react";
import { tv } from "tailwind-variants";
import { Check } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import type { ComponentSize } from "./tokens";
import { cn } from "@/lib/utils";

export interface CheckboxComponentProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  error?: boolean;
  label?: string;
  size?: ComponentSize;
}

const styles = tv({
  base: [
    "flex items-center justify-center w-4 h-4 aspect-square border border-(--border) rounded-sm",
    "overflow-hidden"
  ],
  variants: {
    checked: {
      true: 'bg-black text-white border-black',
      false: ''
    },
    error: {
      true: 'border-red-500',
      false: ''
    }
  },
  defaultVariants: {
    checked: false,
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
  ({ className, error = false, label, size, checked, onChange, ...rest }, ref) => {
    return (
      <div className={cn("relative flex items-center justify-center gap-2 w-fit h-fit hover:bg-white hover:cursor-pointer transition-all ease-in", className)}>
        <input type="checkbox" className="absolute w-full h-full opacity-0"  {...rest} ref={ref} onChange={onChange} />
        <div className={styles({ checked, error })}>
          {checked && (
            <Check size={12} strokeWidth={3} />
          )}
        </div>
        {label && (
          <label className={labelStyles({ size })}>{label}</label>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
