import { X } from 'lucide-react';
import type { ComponentSize } from "@/components/size";

const chipSizeStyles: Record<ComponentSize, string> = {
  xs: "py-0.5 pl-2 pr-1.5 text-[10px]",
  sm: "py-1 pl-2.5 pr-2 text-xs",
  md: "py-1.5 pl-3 pr-2.5 text-sm",
};

const xIconSizes: Record<ComponentSize, string> = {
  xs: "size-[9px]",
  sm: "size-[11px]",
  md: "size-[13px]",
};

interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
  className?: string;
  size?: ComponentSize;
}

export function FilterChip({ label, value, onRemove, className, size = "sm" }: FilterChipProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 bg-(--primary-50) border border-(--primary-100) rounded-full font-medium text-(--primary-600) ${chipSizeStyles[size]} ${className ?? ''}`}>
      <span className="text-(--fg-2) font-normal">{label}:</span>
      <span>{value}</span>
      <button
        type="button"
        onClick={onRemove}
        className="flex items-center justify-center bg-transparent border-none cursor-pointer text-(--primary-600) p-0 rounded-full hover:text-(--primary-700) transition-colors"
      >
        <X className={xIconSizes[size]} />
      </button>
    </div>
  );
}
