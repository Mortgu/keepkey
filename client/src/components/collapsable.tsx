import React, { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import Button from "./button/button";

interface CollapsableProps {
  label: ReactNode;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

export default function Collapsable({
  label,
  children,
  className,
  defaultOpen = false,
}: CollapsableProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <React.Fragment>
      <Button
        size="sm"
        variant="link"
        onClick={() => setOpen((o) => !o)}
        className={className}
        iconPosition="right"
        icon={
          <ChevronDown
            className={`size-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        }
      >
        <span>{label}</span>
      </Button>

      {open && <div className="border-t border-(--border)">{children}</div>}
    </React.Fragment>
  );
}
