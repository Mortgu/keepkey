import { useMemo, useState } from "react";
import { alignClass, sortIconClass, tableStyles } from "./table-styles";
import type { Column, DataTableProps, SortDir } from "./table-types";
import { ChevronDown, ChevronUp } from "lucide-react";

export function DataTable<T>({
    data,
    columns,
    rowKey,
    onRowClick,
    activeRowKey,
    initialSort,
    sort: controlledSort,
    onSortChange,
    emptyLabel = "Keine Einträge.",
    className,
}: DataTableProps<T>) {
    const [uncontrolledSort, setUncontrolledSort] = useState<{ key: string | null; dir: SortDir }>(() => {
        if (!initialSort) return { key: null, dir: "none" as const };
        return { key: initialSort.key, dir: initialSort.dir as SortDir };
    });

    const isControlled = controlledSort !== undefined;
    const sort = controlledSort ?? uncontrolledSort;

    const setSort = (next: { key: string | null; dir: SortDir }) => {
        if (!isControlled) setUncontrolledSort(next);
        onSortChange?.(next);
    };

    const handleHeaderClick = (col: Column<T>) => {
        if (!col.sortable) return;
        const key = col.key;
        if (sort.key === key) {
            const nextDir: SortDir =
                sort.dir === "asc" ? "desc" : sort.dir === "desc" ? "none" : "asc";
            setSort({ key: nextDir === "none" ? null : key, dir: nextDir });
        } else {
            setSort({ key, dir: "asc" });
        }
    };

    const sorted = useMemo(() => {
        if (sort.dir === "none" || sort.key === null) return data;
        const col = columns.find((c) => c.key === sort.key);
        if (!col?.sortValue) return data;

        const valueOf = (row: T) => col.sortValue!(row);
        const direction = sort.dir === "asc" ? 1 : -1;
        return [...data].sort((a, b) => {
            const av = valueOf(a);
            const bv = valueOf(b);
            if (av instanceof Date || bv instanceof Date) {
                return direction * ((av instanceof Date ? av.getTime() : 0) - (bv instanceof Date ? bv.getTime() : 0));
            }
            if (typeof av === "number" && typeof bv === "number") {
                return direction * (av - bv);
            }
            const as = String(av);
            const bs = String(bv);
            return direction * as.localeCompare(bs, undefined, { numeric: true, sensitivity: "base" });
        });
    }, [data, columns, sort]);

    const s = tableStyles();

    return (
        <div className={s.wrap({ className })}>
            <table className={s.table()}>
                <thead>
                    <tr>
                        {columns.map((col) => {
                            const dir = sort.key === col.key ? sort.dir : "none";
                            return (
                                <th
                                    key={col.key}
                                    className={s.th()}
                                    style={col.width ? { width: col.width } : undefined}
                                >
                                    {col.sortable ? (
                                        <button
                                            type="button"
                                            className={s.thButton({ align: col.align })}
                                            onClick={() => handleHeaderClick(col)}
                                            aria-sort={dir === "none" ? "none" : dir === "asc" ? "ascending" : "descending"}
                                        >
                                            {col.align !== "right" && <span className={s.thLabel()}>{col.header}</span>}
                                            <span className={s.sortIcons()}>
                                                <ChevronUp size={12} strokeWidth={3} className={sortIconClass(dir, "up")} />
                                                <ChevronDown size={12} strokeWidth={3} className={sortIconClass(dir, "down")} />
                                            </span>
                                            {col.align === "right" && <span className={s.thLabel()}>{col.header}</span>}
                                        </button>
                                    ) : (
                                        <span className={`${s.thNoSort()} ${alignClass(col.align)} block`}>
                                            {col.header}
                                        </span>
                                    )}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {sorted.length === 0 && (
                        <tr>
                            <td className={s.td()} colSpan={columns.length}>
                                <p className="py-6 text-center text-sm text-(--text-secondary)">{emptyLabel}</p>
                            </td>
                        </tr>
                    )}
                    {sorted.map((row, index) => {
                        const key = rowKey(row);
                        const isActive = activeRowKey != null && activeRowKey === key;
                        return (
                            <tr
                                key={key}
                                className={s.row({ className: isActive ? s.rowActive() : undefined })}
                                onClick={onRowClick ? () => onRowClick(row) : undefined}
                            >
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={`${s.td()} ${alignClass(col.align)}`}
                                    >
                                        {col.render(row, index)}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function SortIcon({ arrow, className }: { arrow: "up" | "down"; className: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            {arrow === "up" ? (
                <polygon points="12,4 20,16 4,16" />
            ) : (
                <polygon points="12,20 4,8 20,8" />
            )}
        </svg>
    );
}
