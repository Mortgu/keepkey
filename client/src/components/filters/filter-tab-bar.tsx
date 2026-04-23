import Button from "../button/button";

interface TabOption {
  value: string;
  label: string;
}

interface FilterTabBarProps {
  tabs: TabOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export function FilterTabBar({ tabs, value, onChange, className, children }: FilterTabBarProps) {
  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className ?? ''}`}>
      {tabs.map(tab => (
        <Button
          size="sm"
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
