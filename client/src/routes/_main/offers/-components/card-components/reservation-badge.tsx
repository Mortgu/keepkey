import {AlertTriangle, Check, Loader} from "lucide-react";
import type {TaskStatus} from "@/types";
import {Badge} from "@/components";

interface ReservationBadgeProps {
    status: TaskStatus;
}

const STATUS_CONFIG: Record<TaskStatus,
    { variant: "generated" | "processing" | "failed"; icon: React.ReactNode; label: string }
> = {
    COMPLETED: {variant: "generated", icon: <Check className="size-3"/>, label: "Reserviert"},
    PENDING: {variant: "processing", icon: <Loader className="size-3 animate-spin"/>, label: "Reservierung…"},
    RUNNING: {variant: "processing", icon: <Loader className="size-3 animate-spin"/>, label: "Reservierung…"},
    FAILED: {variant: "failed", icon: <AlertTriangle className="size-3"/>, label: "Reservierung fehlgeschlagen"},
};

export function ReservationBadge({status}: ReservationBadgeProps) {
    const config = STATUS_CONFIG[status];

    return (
        <Badge variant={config.variant} className="flex items-center gap-1">
            {config.icon}
            {config.label}
        </Badge>
    );
}