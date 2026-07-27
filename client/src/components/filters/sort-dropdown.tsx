import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import type { ComponentSize } from "@/components/size";
import { Button } from "@/components";

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

export function SortDropdown({ value, onChange, options, className, size = "sm" }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.value === value);
  const dir = value?.includes('asc') ? 'asc' : value ? 'desc' : null;

  return (
    <div ref={ref} className={`relative select-none ${className ?? ''}`}>
      <Button
        type="button"
        size={size}
        onClick={() => setOpen(o => !o)}
        className={[
          'flex items-center gap-1.5 py-[6px] pl-3 pr-2.5 bg-white border rounded-md cursor-pointer text-sm whitespace-nowrap transition-[border-color,box-shadow] duration-[120ms]',
          open ? 'border-(--primary-600) ring-3 ring-(--primary-600)/12' : 'border-(--border)',
        ].join(' ')}
      >
        <span className="text-(--fg-3) flex items-center">
          <SortIcon dir={dir} />
        </span>
        <span className="text-(--fg-2) font-normal">Sort:</span>
        <span className="font-medium text-(--text)">{selected?.label ?? options[0]?.label}</span>
        <ChevronDown className="size-3 shrink-0" />
      </Button>

      {open && (
        <div className="w-full absolute top-[calc(100%+4px)] right-0 z-50 bg-white border border-(--border) rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.10)] min-w-[220px] overflow-hidden py-1">
          {options.map(o => (
            <div
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={[
                'flex items-center gap-2 px-3 py-[7px] cursor-pointer text-sm text-(--text) transition-colors duration-[80ms]',
                o.value === value ? 'bg-(--primary-50) hover:bg-(--primary-50)' : 'hover:bg-(--page-bg)',
              ].join(' ')}
            >
              <span className="flex-1">{o.label}</span>
              {o.value === value && <Check className="size-3.5 text-(--primary-600)" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
