import { forwardRef } from "react";
import { tv } from "tailwind-variants";
import type { ToggleSliderComponentProps } from "./toggle-slider-types";

const styles = tv({
  slots: {
    container: "flex items-center gap-3",
    wrapper: [
      "relative inline-flex w-12 h-6 rounded-full transition-colors duration-200",
      "cursor-pointer focus-within:ring-2 focus-within:ring-[var(--primary-25)] focus-within:ring-offset-1",
      "disabled:cursor-not-allowed disabled:opacity-50",
    ],
    track: [
      "absolute inset-0 rounded-full transition-colors duration-200",
      "bg-gray-300 peer-checked:bg-[var(--primary)]",
      "peer-disabled:bg-gray-200",
    ],
    thumb: [
      "absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md",
      "transition-transform duration-200",
      "peer-checked:translate-x-6",
      "peer-disabled:shadow-none",
    ],
    input: "peer sr-only",
  },
});

const { container, wrapper, track, thumb, input } = styles();

export const ToggleSlider = forwardRef<HTMLInputElement, ToggleSliderComponentProps>(
  ({ className, label, disabled, ...rest }, ref) => {
    return (
      <div className={container()}>
        <label className={wrapper()}>
          <input
            ref={ref}
            type="checkbox"
            className={input()}
            disabled={disabled}
            {...rest}
          />
          <span className={track()} />
          <span className={thumb()} />
        </label>
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

ToggleSlider.displayName = "ToggleSlider";
