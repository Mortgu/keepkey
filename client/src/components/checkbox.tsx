import { forwardRef } from "react";
import { tv } from "tailwind-variants";
import { Check } from "lucide-react";
import { LabelBadge } from "./field";
import { CONTROL_TEXT } from "./tokens";
import type { InputHTMLAttributes } from "react";
import type { ComponentSize } from "./tokens";
import { cn } from "@/lib/utils";

export interface CheckboxComponentProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
    size?: ComponentSize;

    /** Optional label rendered next to the box. */
    label?: string;

    /** Short error label shown as a badge next to the label. Turns the box border red. */
    error?: string;

    /** Longer explanation shown in a tooltip when the error badge is hovered. */
    errorTooltip?: string;
}

const boxStyles = tv({
    base: [
        "flex items-center justify-center w-4 h-4 aspect-square shrink-0",
        "border border-(--border) rounded-sm overflow-hidden transition-colors duration-100",
        // Der echte <input> ist transparent; der Fokusring muss deshalb auf der
        // sichtbaren Box landen (peer = der Input davor).
        "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--primary)",
    ],
    variants: {
        checked: {
            true: "bg-(--primary) text-(--text-inv) border-(--primary)",
            false: "bg-white",
        },
        error: {
            true: "border-(--destructive)",
            false: "",
        },
    },
    defaultVariants: {
        checked: false,
        error: false,
    },
});

const labelStyles = tv({
    base: "font-medium text-(--text-600) cursor-pointer",
    variants: {
        size: CONTROL_TEXT,
    },
    defaultVariants: {
        size: "sm",
    },
});

export const Checkbox = forwardRef<HTMLInputElement, CheckboxComponentProps>(
    ({ className, error, errorTooltip, label, size, checked, onChange, ...rest }, ref) => (
        <div
            className={cn(
                "relative flex w-fit h-fit items-center justify-center gap-2",
                "transition-all ease-in hover:cursor-pointer",
                className,
            )}
        >
            <input
                type="checkbox"
                className="peer absolute w-full h-full opacity-0 cursor-pointer"
                checked={checked}
                onChange={onChange}
                {...rest}
                ref={ref}
            />
            <div className={boxStyles({ checked: !!checked, error: !!error })}>
                {checked && <Check size={12} strokeWidth={3} />}
            </div>
            {label && <label className={labelStyles({ size })}>{label}</label>}
            {error && <LabelBadge kind="error" label={error} tooltip={errorTooltip} />}
        </div>
    ),
);

Checkbox.displayName = "Checkbox";
