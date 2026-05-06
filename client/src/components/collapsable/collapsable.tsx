import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components";
import type { CollapsableComponentProps } from "./collapsable-types";

export function Collapsable({
  label,
  children,
  className,
  defaultOpen = false,
}: CollapsableComponentProps) {
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
