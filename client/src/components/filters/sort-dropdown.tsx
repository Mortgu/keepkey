import { Select } from "@base-ui/react";
import { Check, ChevronDown } from "lucide-react";
import { buttonStyles } from "../button";
import { selectStyles } from "../select-styles";
import type { ComponentSize } from "../tokens";

export interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<SortOption>;
  className?: string;
  size?: ComponentSize;
}

export const SortIcon = ({ dir }: { dir: 'asc' | 'desc' | null }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    {dir === 'asc' && (
      <>
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </>
    )}
    {dir === 'desc' && (
      <>
        <line x1="12" y1="5" x2="12" y2="19" />
        <polyline points="19 12 12 19 5 12" />
      </>
    )}
    {!dir && (
      <>
        <polyline points="5 9 12 2 19 9" opacity="0.35" />
        <polyline points="19 15 12 22 5 15" opacity="0.35" />
      </>
    )}
  </svg>
);

/**
 * Einfachauswahl als Popover. Wie `MultiDropdown` auf base-ui `Select`, nur ohne
 * `multiple` — Größe und Fokus kommen über `buttonStyles` aus den Tokens.
 */
export function SortDropdown({ value, onChange, options, className, size = "sm" }: SortDropdownProps) {
  const styles = selectStyles();

  const selected = options.find(o => o.value === value);
  const dir = value.includes('asc') ? 'asc' : value ? 'desc' : null;

  return (
    <Select.Root
      items={options}
      value={value}
      onValueChange={(next) => { if (next !== null) onChange(next); }}
    >
      <Select.Trigger
        className={buttonStyles({ variant: "border", size, className: `w-fit whitespace-nowrap ${className ?? ""}` })}
      >
        <span className="text-(--text-secondary) flex items-center">
          <SortIcon dir={dir} />
        </span>
        <span className="text-(--text-600) font-normal">Sort:</span>
        <span className="font-medium text-(--text)">{selected?.label ?? options[0]?.label}</span>
        <Select.Icon className={styles.Icon()}>
          <ChevronDown size={12} />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Positioner className={styles.Positioner()} sideOffset={4} align="end" alignItemWithTrigger={false}>
          <Select.Popup className={styles.Popup()}>
            <Select.List className={styles.List()}>
              {options.map((option) => (
                <Select.Item key={option.value} value={option.value} className={styles.Item()}>
                  <Select.ItemIndicator className={styles.ItemIndicator()}>
                    <Check size={14} />
                  </Select.ItemIndicator>
                  <Select.ItemText className={styles.ItemText()}>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
