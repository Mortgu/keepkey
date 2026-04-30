import { ChevronDown } from "lucide-react";

export default function Collapsable() {
  return (
    <div className="border-t border-(--border)">
      <div className="flex items-center justify-start gap-2 p-2">
        <ChevronDown className="size-4" />
        <p>Enterprise Unlimited</p>
      </div>
      <div className="border-t border-(--border) py-2 px-2 flex items-center justify-between">
        <p>Buisness Unlimited</p>
        <p>1 - 100</p>
        <p>2.44€/User</p>
      </div>
    </div>
  );
}
