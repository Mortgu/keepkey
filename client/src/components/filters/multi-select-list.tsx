import { Check } from 'lucide-react';
import type { DropdownOption } from './multi-dropdown';

export interface MultiSelectListProps {
  options: Array<DropdownOption>;
  values: Array<string>;
  onChange: (values: Array<string>) => void;
  className?: string;
}

export function MultiSelectList({ options, values, onChange, className }: MultiSelectListProps) {
  const toggle = (v: string) =>
    onChange(values.includes(v) ? values.filter(x => x !== v) : [...values, v]);

  const count = values.length;

  return (
    <div className={`w-full border border-(--border) rounded-lg overflow-hidden ${className ?? ''}`}>
      <div className="max-h-[240px] overflow-y-auto scrollbar">
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
                  <Check size={12} className='text-white' />
                )}
              </div>
              {o.dot && <span className="size-[7px] rounded-full shrink-0" style={{ background: o.dot }} />}
              <span className="flex-1">{o.label}</span>
            </div>
          );
        })}
      </div>

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
  );
}
