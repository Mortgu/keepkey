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
      <Input
        rightIcon={<Search className="size-4" />}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSubmit?.()}
        placeholder={placeholder}
      />
    </div>
  );
}
