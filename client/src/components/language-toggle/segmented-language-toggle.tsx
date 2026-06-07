import type { LanguageToggleProps } from "./language-toggle-types";
import { cn } from "@/lib/utils";

/**
 * Segmented control with a sliding white thumb behind the active option.
 * Scales to any number of options.
 */
export const SegmentedLanguageToggle = ({
  options,
  value,
  onChange,
  className,
  "aria-label": ariaLabel = "Language",
}: LanguageToggleProps) => {
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.code === value),
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
      <span
        aria-hidden
        className="absolute top-0.75 bottom-0.75 left-0.75 rounded bg-white shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          width: `calc((100% - 6px) / ${options.length})`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />
      {options.map((o) => {
        const active = o.code === value;
        return (
          <button
            key={o.code}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.code)}
            className={cn(
              "relative z-10 min-w-14 flex-1 rounded px-4 py-1.25 text-sm  font-medium transition-colors",
              active && "font-semibold text-(--primary)",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
};

SegmentedLanguageToggle.displayName = "SegmentedLanguageToggle";
