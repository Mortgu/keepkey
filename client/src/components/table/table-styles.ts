import { tv } from "tailwind-variants";
import type { Align, SortDir } from "./table-types";

export const tableStyles = tv({
    slots: {
        wrap: "bg-white border border-(--border) rounded-md overflow-hidden",
        table: "w-full border-collapse",
        th: "text-left p-0 border-b border-(--border) bg-(--subtle-50)",
        thButton:
            "flex items-center gap-1.5 w-full h-full px-4 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.04em] text-(--text-secondary) bg-transparent border-none cursor-pointer text-left transition-colors hover:text-(--text)",
        thLabel: "flex-1",
        thNoSort:
            "px-4 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.04em] text-(--text-secondary)",
        sortIcons: "flex flex-col gap-px ml-0.5 shrink-0",
        sortIcon: "size-2 text-(--border) transition-colors",
        row: "border-b border-(--border) last:border-b-0 cursor-pointer transition-colors hover:bg-(--subtle-50)",
        rowActive: "bg-[#E6F2EC] hover:bg-[#E6F2EC]",
        td: "px-4 py-3 text-[13.5px] text-(--text) align-middle",
        tdNum: "text-right tabular-nums",
    },
    variants: {
        align: {
            left: { thButton: "justify-start text-left" },
            right: { thButton: "justify-end text-right" },
        },
        dir: {
            asc: {},
            desc: {},
            none: {},
        },
    },
});

export function sortIconClass(dir: SortDir, arrow: "up" | "down") {
    const active =
        (arrow === "up" && dir === "asc") ||
        (arrow === "down" && dir === "desc");
    return active ? "text-(--primary)" : "text-(--text)";
}

export function alignClass(align: Align | undefined) {
    return align === "right" ? "text-right tabular-nums" : "text-left";
}
