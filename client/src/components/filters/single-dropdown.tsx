import { useRef, useEffect, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  dot?: string;
}

interface SingleDropdownProps {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SingleDropdown({ label, options, value, onChange, className }: SingleDropdownProps) {
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

  return (
    <div ref={ref} className={`relative select-none ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={[
          'flex items-center gap-1.5 py-[6px] pl-3 pr-2.5 border rounded-md cursor-pointer font-medium text-sm whitespace-nowrap min-w-[130px] transition-[border-color,box-shadow] duration-[120ms]',
          open
            ? 'bg-(--subtle-50) border-(--primary-600) ring-3 ring-(--primary-600)/12'
            : 'bg-white border-(--border)',
        ].join(' ')}
      >
        {selected?.dot && (
          <span className="size-[7px] rounded-full shrink-0" style={{ background: selected.dot }} />
        )}
        <span className={`flex-1 text-left ${selected ? 'text-(--text)' : 'text-(--fg-3)'}`}>
          {selected ? selected.label : label}
        </span>
        <ChevronDown className="size-3 shrink-0" />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 z-50 bg-white border border-(--border) rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.10)] min-w-[180px] overflow-hidden py-1">
          {options.map(o => (
            <div
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={[
                'flex items-center gap-2 px-3 py-[7px] cursor-pointer text-sm text-(--text) transition-colors duration-[80ms]',
                o.value === value ? 'bg-(--primary-50) hover:bg-(--primary-50)' : 'hover:bg-(--page-bg)',
              ].join(' ')}
            >
              {o.dot && (
                <span className="size-[7px] rounded-full shrink-0" style={{ background: o.dot }} />
              )}
              <span className="flex-1">{o.label}</span>
              {o.value === value && <Check className="size-3.5 text-(--primary-600)" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
