import { forwardRef } from "react";
import { tv } from "tailwind-variants";
import { Check } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import type { ComponentSize } from "./tokens";

export interface CheckboxComponentProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
    error?: boolean;
    label?: string;
    size?: ComponentSize;
}

const checkboxSizes = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
} as const;

const styles = tv({
  base: [
    "flex items-center justify-center w-4 h-4 aspect-square border border-(--border) rounded-sm",
    "overflow-hidden"
  ],
  variants: {
    checked: {
      true: 'bg-black text-white border-black',
      false: ''
    }
  },
  defaultVariants: {
    checked: false,
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
  ({ className, label, error = false, size, checked, onChange, ...rest }, ref) => {
    return (
      <div className="relative flex items-center justify-center gap-2 w-fit h-fit hover:bg-white hover:cursor-pointer transition-all ease-in">
        <input type="checkbox" className="peer sr-only absolute w-full h-full hidden"  {...rest} ref={ref} />
        <div className={styles({ checked })}>
          {checked && (
            <Check size={12} strokeWidth={3} />
          )}
        </div>
        {label && (
          <label className="text-sm">{label}</label>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
