import { Select } from "@base-ui/react";
import { Check, ChevronDown } from "lucide-react";
import { buttonStyles } from "../button";
import { selectStyles } from "../select-styles";
import type { ComponentSize } from "../tokens";

export interface DropdownOption {
  value: string;
  label: string;
  dot?: string;
}

export interface MultiDropdownProps {
  label: string;
  options: Array<DropdownOption>;
  values: Array<string>;
  onChange: (values: Array<string>) => void;
  className?: string;
  size?: ComponentSize;
}

/**
 * Mehrfachauswahl als Popover. Anatomie und Optik teilen sich Trigger und Popup
 * mit `Select` über `selectStyles` — der Trigger ist hier aber ein Button, kein
 * Eingabefeld.
 */
export function MultiDropdown({ label, options, values, onChange, className, size = "sm" }: MultiDropdownProps) {
  const styles = selectStyles();
  const count = values.length;

  function renderValue(selected: string[]) {
    if (selected.length === 0) return "";
    const first = options.find((o) => o.value === selected[0]);
    const label = first?.label ?? selected[0];
    const more = selected.length > 1 ? ` (+${selected.length - 1})` : "";
    return `: ${label}${more}`;
  }

  return (
    <Select.Root multiple items={options} value={values} onValueChange={onChange}>
      <Select.Trigger className={buttonStyles({ variant: "border", size, className: `w-fit ${className ?? ""}` })}>
        <span className={count > 0 ? "text-(--text)" : "text-(--text-secondary)"}>
          {label}
          {count > 0 && renderValue(values)}
        </span>

        <Select.Icon className={styles.Icon()}>
          <ChevronDown size={12} />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Positioner className={styles.Positioner()} sideOffset={4} align="start" alignItemWithTrigger={false}>
          <Select.Popup className={styles.Popup()}>
            <Select.List className={styles.List()}>
              {options.map((option) => (
                <Select.Item key={option.value} value={option.value} className={styles.Item()}>
                  <Select.ItemIndicator className={styles.ItemIndicator()}>
                    <Check size={14} />
                  </Select.ItemIndicator>

                  <Select.ItemText className={styles.ItemText()}>
                    {option.dot && (
                      <span
                        className="inline-block size-[7px] rounded-full shrink-0 mr-2 align-middle"
                        style={{ background: option.dot }}
                      />
                    )}
                    {option.label}
                  </Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>

            {count > 0 && (
              <>
                <div className={styles.Separator()} />
                <div className={styles.Footer()}>
                  <button
                    type="button"
                    onClick={() => onChange([])}
                    className="text-xs text-(--text-secondary) cursor-pointer hover:text-(--text) transition-colors"
                  >
                    Clear selection
                  </button>
                </div>
              </>
            )}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
