import type { ReactNode } from "react";
import type { LanguageToggleProps } from "./language-toggle-types";

import { cn } from "@/lib/utils";

export interface SegmentedToggleOption<TValue extends string = string> {
  /** Stable option value used by the controlled toggle. */
  value: TValue;
  /** Visible option label. */
  label: ReactNode;
  disabled?: boolean;
}

export interface SegmentedToggleProps<TValue extends string = string> {
  options: Array<SegmentedToggleOption<TValue>>;
  value: TValue;
  onChange: (value: TValue) => void;
  className?: string;
  optionClassName?: string;
  thumbClassName?: string;
  /** Accessible label for the underlying tablist. */
  "aria-label"?: string;
}

/**
 * Generic segmented control with a sliding thumb behind the active option.
 * Scales to any number of string-valued options.
 */
export function SegmentedToggle<TValue extends string = string>({
  options,
  value,
  onChange,
  className,
  optionClassName,
  thumbClassName,
  "aria-label": ariaLabel = "Segmented control",
}: SegmentedToggleProps<TValue>) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex rounded-md border border-(--border) bg-(--subtle-50) p-0.75",
        className,
      )}
    >
      {options.length > 0 && (
        <span
          aria-hidden
          className={cn(
            "absolute top-0.75 bottom-0.75 left-0.75 rounded bg-white shadow-sm transition-transform duration-200 ease-in-out",
            thumbClassName,
          )}
          style={{
            width: `calc((100% - 6px) / ${options.length})`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
      )}

      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 min-w-14 flex-1 rounded px-4 py-1.25 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              active && "font-semibold text-(--primary)",
              optionClassName,
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

SegmentedToggle.displayName = "SegmentedToggle";

/**
 * Language-specific compatibility wrapper around the generic SegmentedToggle.
 * Prefer SegmentedToggle for non-language use cases.
 */
export const SegmentedLanguageToggle = ({
  options,
  value,
  onChange,
  className,
  "aria-label": ariaLabel = "Language",
}: LanguageToggleProps) => {
  return (
    <SegmentedToggle
      aria-label={ariaLabel}
      className={className}
      options={options.map((option) => ({
        value: option.code,
        label: option.label,
      }))}
      value={value}
      onChange={(nextValue) =>
        onChange(nextValue as Parameters<typeof onChange>[0])
      }
    />
  );
};

SegmentedLanguageToggle.displayName = "SegmentedLanguageToggle";
