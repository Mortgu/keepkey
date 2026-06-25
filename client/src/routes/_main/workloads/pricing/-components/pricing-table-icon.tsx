import { Button } from "@/components";
import { ChevronDown, UndoDot, Plus } from "lucide-react";
import { useState } from "react";

export default function PricingTableItem() {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <div>
            <div className="flex items-center justify-between border-b border-(--border) last:border-none">
                <div className="w-full px-4 py-2 hover:bg-(--page-bg) cursor-pointer border-r border-(--border) select-none"
                    onClick={() => setOpen(!open)}>
                    <div className="flex items-center gap-4">
                        <Button size="fit_xs" variant="link" icon={<ChevronDown className="size-4" />} iconOnly />
                        <div>
                            <p>Buisness Esentials</p>
                            <p className="text-sm text-(--text-secondary)">20. April 2026</p>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-2 flex items-center gap-2">
                    <Button size="sm" variant="secondary" icon={<UndoDot className="size-3.5" />} iconOnly />
                    <Button size="sm" variant="secondary" icon={<Plus className="size-3.5" />} iconOnly />
                </div>
            </div>

            {open && (
                <div className="p-4 border"></div>
            )}
        </div>
    )
}