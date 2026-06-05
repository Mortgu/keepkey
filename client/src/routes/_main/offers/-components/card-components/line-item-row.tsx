import type { ReactNode } from "react";

interface LineItemRowProps {
  left: ReactNode;
  right: ReactNode;
}

export function LineItemRow({ left, right }: LineItemRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 border border-(--border) py-2 px-3 rounded-md">
      <div>{left}</div>
      <div className="flex flex-col items-end">
        {right}
      </div>
    </div>
  );
}