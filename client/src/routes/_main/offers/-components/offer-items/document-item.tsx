import { Button } from "@/components";
import { Cloud, File, FileDown, RotateCw } from "lucide-react";

export function DocumentItem() {
    return (
        <div className="flex items-center justify-between border border-(--border) py-2 px-2 rounded-md">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-(--subtle-50) rounded-full">
                    <File className="size-4" />
                </div>
                <div className="flex flex-col justify-between">
                    <h1 className="text-md">260000_AG_Kunde_Keepit-workloads_M365+EntraID</h1>
                    <div className="flex font-light text-sm gap-2 text-(--text-secondary)">
                        <p>05. Mai 2026</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" icon={<Cloud className="size-3.5" />}>
                    NextCloud
                </Button>
                <Button variant="secondary" size="sm" icon={<FileDown className="size-3.5" />} iconOnly />
            </div>
        </div>
    )
} 