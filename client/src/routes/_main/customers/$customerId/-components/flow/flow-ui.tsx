import { Ban, Plus, TriangleAlert } from "lucide-react";
import { cn } from "tailwind-variants";
import { STATION } from "./flow-meta";
import type { StageKind, StageState } from "./flow-types";

const NODE: Record<StageState, string> = {
    done: "bg-(--primary-600) text-(--text-inv) border-(--primary-600)",
    action: "bg-(--primary-50) text-(--primary-600) border-dashed border-(--primary-400)",
    locked: "bg-white text-(--fg-3) border-(--border)",
    busy: "bg-(--info-subtle) text-(--info) border-(--info) motion-safe:animate-pulse",
    failed: "bg-(--destructive-subtle) text-(--destructive) border-(--destructive-line)",
    cancelled: "bg-(--subtle-50) text-(--fg-3) border-(--border-200)",
};

/** Runder Zustandsmarker einer Station. */
export function StageNode({ kind, state, size = "md" }: { kind: StageKind; state: StageState; size?: "sm" | "md" }) {
    const glyph = state === "cancelled" ? <Ban className="size-3.5" />
        : state === "failed" ? <TriangleAlert className="size-3.5" />
            : state === "action" ? <Plus className="size-3.5" />
                : STATION[kind].icon;

    return (
        <span className={cn(
            "grid shrink-0 place-items-center rounded-full border",
            size === "md" ? "size-7" : "size-6 [&_svg]:size-3",
            NODE[state],
        )}>
            {glyph}
        </span>
    );
}
