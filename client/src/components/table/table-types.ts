import type { ReactNode } from "react";

export type SortDir = "asc" | "desc" | "none";

export type Align = "left" | "right";

export interface Column<T> {
    /** Stable column id; doubles as sort key. */
    key: string;
    header: ReactNode;
    render: (row: T, index: number) => ReactNode;
    /** Returns the comparable value used for sorting. Required when `sortable` is true. */
    sortValue?: (row: T) => string | number | Date;
    sortable?: boolean;
    align?: Align;
    /** Fixed width, e.g. "36px" or "120px". */
    width?: string;
}

export interface DataTableProps<T> {
    data: Array<T>;
    columns: Array<Column<T>>;
    rowKey: (row: T) => string;
    onRowClick?: (row: T) => void;
    /** Key of the row to highlight as active. */
    activeRowKey?: string | null;
    /** Uncontrolled initial sort. */
    initialSort?: { key: string; dir: Omit<SortDir, "none"> };
    /** Controlled sort state. When provided, the table becomes controlled. */
    sort?: { key: string | null; dir: SortDir };
    onSortChange?: (sort: { key: string | null; dir: SortDir }) => void;
    emptyLabel?: ReactNode;
    className?: string;
}
