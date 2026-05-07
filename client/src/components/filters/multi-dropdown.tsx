import { useRef, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '../button/button';

export interface DropdownOption {
  value: string;
  label: string;
  dot?: string;
}

interface MultiDropdownProps {
  label: string;
  options: DropdownOption[];
  values: string[];
  onChange: (values: string[]) => void;
  className?: string;
}

export function MultiDropdown({ label, options, values, onChange, className }: MultiDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (v: string) =>
    onChange(values.includes(v) ? values.filter(x => x !== v) : [...values, v]);

  const count = values.length;

  return (
    <div ref={ref} className={`relative select-none ${className ?? ''}`}>
      <Button
        variant="secondary"
        type="button"
        size="sm"
        onClick={() => setOpen(o => !o)}

      >
        <span className={`flex-1 text-left ${count > 0 ? 'text-(--text)' : 'text-(--fg-3)'}`}>
          {count > 0 ? `${label}: ${count} selected` : label}
        </span>
        {count > 0 && (
          <span className="bg-(--primary-600) text-white rounded-full text-xs aspect-square px-1.5 py-px min-w-[18px] text-center">
            {count}
          </span>
        )}
        <ChevronDown className="size-3 shrink-0" />
      </Button>

      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 z-50 bg-white border border-(--border) rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.10)] min-w-[200px] overflow-hidden py-1">
          {options.map(o => {
            const checked = values.includes(o.value);
            return (
              <div
                key={o.value}
                onClick={() => toggle(o.value)}
                className={[
                  'flex items-center gap-2.5 px-3 py-[7px] cursor-pointer text-sm text-(--text) transition-colors duration-[80ms]',
                  checked ? 'bg-(--primary-50) hover:bg-(--primary-50)' : 'hover:bg-(--page-bg)',
                ].join(' ')}
              >
                <div className={[
                  'size-[15px] rounded-[4px] shrink-0 flex items-center justify-center border-[1.5px] transition-all duration-[120ms]',
                  checked ? 'bg-(--primary-600) border-(--primary-600)' : 'bg-white border-(--border-200)',
                ].join(' ')}>
                  {checked && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                {o.dot && <span className="size-[7px] rounded-full shrink-0" style={{ background: o.dot }} />}
                <span className="flex-1">{o.label}</span>
              </div>
            );
          })}
          {count > 0 && (
            <div className="border-t border-(--border) px-3 py-1.5">
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-(--fg-3) bg-transparent border-none cursor-pointer p-0 hover:text-(--text) transition-colors"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
