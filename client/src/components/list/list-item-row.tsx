import { Pen, Trash } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components";
import { cn } from "@/lib/utils";

export interface ListItemRowProps {
    /** Left-side card content. */
    children: ReactNode;
    onEdit?: () => void;
    onDelete?: () => void;
    editLabel?: string;
    deleteLabel?: string;
    deleteLoading?: boolean;
    className?: string;
}

export function ListItemRow({
    children,
    onEdit,
    onDelete,
    editLabel,
    deleteLabel,
    deleteLoading,
    className,
}: ListItemRowProps) {
    return (
        <div className={cn("flex items-center justify-between bg-white border border-(--border) rounded-md overflow-hidden px-4 py-3", className)}>
            {children}
            <div className="flex items-center gap-2">
                {onEdit && (
                    <Button
                        size="sm"
                        variant="border"
                        icon={<Pen className="size-3.5" />}
                        iconOnly
                        aria-label={editLabel}
                        onClick={onEdit}
                    />
                )}
                {onDelete && (
                    <Button
                        size="sm"
                        variant="border"
                        icon={<Trash className="size-3.5" />}
                        iconOnly
                        aria-label={deleteLabel}
                        onClick={onDelete}
                        loading={deleteLoading}
                    />
                )}
            </div>
        </div>
    );
}
