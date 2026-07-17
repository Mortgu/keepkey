/* ──────────────────────────────────────────────────────────────────────
   FilterSidebar types + helpers (kept separate so the component module
   only exports React components — required by react-refresh).
   ────────────────────────────────────────────────────────────────────── */

export type FilterValue = string | Array<string> | [number, number];

export interface FilterPillsSection {
    id: string;
    title: string;
    kind: "pills";
    options: Array<string>;
    default?: string;
    defaultOpen?: boolean;
}

export interface FilterCheckboxesSection {
    id: string;
    title: string;
    kind: "checkboxes";
    items: Array<{ value: string; label: string; count?: number }>;
    searchable?: boolean;
    placeholder?: string;
    defaultOpen?: boolean;
}

export interface FilterPriceSection {
    id: string;
    title: string;
    kind: "price";
    min: number;
    max: number;
    step?: number;
    defaultOpen?: boolean;
}

export type FilterSectionConfig =
    | FilterPillsSection
    | FilterCheckboxesSection
    | FilterPriceSection;

export interface FilterSidebarLabels {
    title: string;
    reset: string;
    apply: string;
    applyWithCount: string;
    noResults: string;
}

export interface FilterSidebarProps {
    sections: Array<FilterSectionConfig>;
    value: Record<string, FilterValue>;
    onChange: (id: string, value: FilterValue) => void;
    onReset?: () => void;
    onApply?: () => void;
    activeCount?: number;
    labels?: Partial<FilterSidebarLabels>;
    className?: string;
}

export const DEFAULT_LABELS: FilterSidebarLabels = {
    title: "Filter",
    reset: "Zurücksetzen",
    apply: "Filter anwenden",
    applyWithCount: "Filter anwenden",
    noResults: "Keine Treffer",
};

export const formatEUR = (n: number) =>
    n.toLocaleString("de-DE", { maximumFractionDigits: 0 });

export function createDefaultFilters(
    sections: Array<FilterSectionConfig>,
): Record<string, FilterValue> {
    const out: Record<string, FilterValue> = {};
    for (const s of sections) {
        if (s.kind === "pills") out[s.id] = s.default ?? s.options[0];
        else if (s.kind === "checkboxes") out[s.id] = [];
        else out[s.id] = [s.min, s.max];
    }
    return out;
}

export function sectionCount(s: FilterSectionConfig, v: FilterValue): number {
    if (s.kind === "checkboxes") return (v as Array<string>).length;
    if (s.kind === "pills") return v !== (s.default ?? s.options[0]) ? 1 : 0;
    const [lo, hi] = v as [number, number];
    return lo !== s.min || hi !== s.max ? 1 : 0;
}

export function isFilterActive(s: FilterSectionConfig, v: FilterValue): boolean {
    return sectionCount(s, v) > 0;
}
