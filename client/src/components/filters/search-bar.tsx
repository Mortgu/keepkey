import { Search } from 'lucide-react';
import { Input } from '../inputs';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, onSubmit, placeholder, className }: SearchBarProps) {
  return (
      <div className={`relative flex-1 ${className ?? ''}`}>
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-(--fg-3) pointer-events-none" />
        <Input
         value={value}
         onChange={e => onChange(e.target.value)}
         onKeyDown={e => e.key === 'Enter' && onSubmit?.()}
         placeholder={placeholder}
         className="w-full text-sm text-(--text) bg-white border border-(--border) rounded-md py-[6px] pl-8 pr-2.5 outline-none placeholder:text-(--fg-3)"
        />
      </div>
    );
 }
