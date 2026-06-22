import type { ComponentSize } from "@/components/size";
import { Button } from "@/components";

interface TabOption {
  value: string;
  label: string;
}

interface FilterTabBarProps {
  tabs: Array<TabOption>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: ComponentSize;
  children?: React.ReactNode;
}

export function FilterTabBar({ tabs, value, onChange, className, size = "sm", children }: FilterTabBarProps) {
  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className ?? ''}`}>
      {tabs.map(tab => (
        <Button
          size={size}
          variant="secondary"
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          active={tab.value === value}
        >
          {tab.label}
        </Button>
      ))}

      {children && (
        <>
          <div className="w-px h-[18px] bg-(--border) mx-1 shrink-0" />
          {children}
        </>
      )}
    </div>
  );
}
