import { X } from 'lucide-react';

interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
  className?: string;
}

export function FilterChip({ label, value, onRemove, className }: FilterChipProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 py-1 pl-2.5 pr-2 bg-(--primary-50) border border-(--primary-100) rounded-full text-xs font-medium text-(--primary-600) ${className ?? ''}`}>
      <span className="text-(--fg-2) font-normal">{label}:</span>
      <span>{value}</span>
      <button
        type="button"
        onClick={onRemove}
        className="flex items-center justify-center bg-transparent border-none cursor-pointer text-(--primary-600) p-0 rounded-full hover:text-(--primary-700) transition-colors"
      >
        <X className="size-[11px]" />
      </button>
    </div>
  );
}
