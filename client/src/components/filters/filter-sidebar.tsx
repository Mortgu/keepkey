import { useState } from "react";
import { tv } from "tailwind-variants";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import {
    DEFAULT_LABELS,
    
    formatEUR,
    sectionCount
} from "./filter-sidebar-types";
import { FilterChip } from "./filter-chip";
import type {FilterSidebarProps} from "./filter-sidebar-types";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ── Section wrapper: title, active-count badge, collapsible ──────────── */

const sectionStyles = tv({
    base: "border-b border-(--border) py-4",
});

function FilterSection({
    title,
    count,
    defaultOpen = true,
    children,
}: {
    title: string;
    count: number;
    defaultOpen?: boolean;
    children: ReactNode;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className={sectionStyles()}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between bg-transparent border-none cursor-pointer p-0 font-sans"
            >
                <span className="flex items-center gap-1.5">
                    <span className="text-[12.5px] font-semibold text-(--text)">
                        {title}
                    </span>
                    {count > 0 && (
                        <span className="text-[10.5px] font-semibold text-(--primary-600) bg-(--primary-50) rounded-full px-1.5 py-0.5 min-w-4 text-center">
                            {count}
                        </span>
                    )}
                </span>
                <ChevronDown
                    className={cn(
                        "size-3 text-(--fg-3) transition-transform duration-150",
                        open && "rotate-180",
                    )}
                />
            </button>
            {open && <div className="mt-3">{children}</div>}
        </div>
    );
}

/* ── Segmented pill row — e.g. Geschäftsjahr ────────────────────────── */

function PillRow({
    options,
    value,
    onChange,
}: {
    options: Array<string>;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {options.map((o) => {
                const on = o === value;
                return (
                    <button
                        key={o}
                        type="button"
                        onClick={() => onChange(o)}
                        className={cn(
                            "font-medium text-[12.5px] px-3 py-1.5 rounded-full border transition-all duration-[120ms]",
                            on
                                ? "bg-(--primary-50) border-(--primary-600) text-(--primary-600)"
                                : "bg-white border-(--border) text-(--text-600) hover:border-(--border-200)",
                        )}
                    >
                        {o}
                    </button>
                );
            })}
        </div>
    );
}

/* ── Checkbox list, with optional inline search for long lists ───────── */

function CheckboxFilterList({
    items,
    values,
    onChange,
    searchable,
    placeholder,
    noResults,
}: {
    items: Array<{ value: string; label: string; count?: number }>;
    values: Array<string>;
    onChange: (v: Array<string>) => void;
    searchable?: boolean;
    placeholder?: string;
    noResults: string;
}) {
    const [q, setQ] = useState("");
    const filtered = searchable
        ? items.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()))
        : items;
    const toggle = (v: string) =>
        onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);

    return (
        <div>
            {searchable && (
                <div className="relative mb-2.5">
                    <Search className="size-[13px] absolute left-2.5 top-1/2 -translate-y-1/2 text-(--fg-3)" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder={placeholder}
                        className="w-full font-sans text-[12.5px] text-(--text) bg-(--page-bg) border border-(--border) rounded-md py-1.5 pl-7 pr-2.5 outline-none focus:border-(--primary-600)"
                    />
                </div>
            )}
            <div className="flex flex-col gap-0.5 max-h-[168px] overflow-y-auto">
                {filtered.map((item) => {
                    const checked = values.includes(item.value);
                    return (
                        <label
                            key={item.value}
                            className="flex items-center gap-2.5 px-0.5 py-[5px] rounded cursor-pointer hover:bg-(--page-bg)"
                        >
                            <span
                                className={cn(
                                    "size-[15px] rounded-[4px] shrink-0 flex items-center justify-center border-[1.5px] transition-all duration-[120ms]",
                                    checked
                                        ? "bg-(--primary-600) border-(--primary-600)"
                                        : "bg-white border-(--border-200)",
                                )}
                            >
                                {checked && (
                                    <svg
                                        width="9"
                                        height="9"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </span>
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggle(item.value)}
                                className="hidden"
                            />
                            <span className="flex-1 text-[13px] text-(--text)">
                                {item.label}
                            </span>
                            {item.count !== undefined && (
                                <span className="text-[11.5px] text-(--fg-3) tabular-nums">
                                    {item.count}
                                </span>
                            )}
                        </label>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="text-[12.5px] text-(--fg-3) px-0.5 py-1.5">
                        {noResults}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Dual-thumb price range slider ──────────────────────────────────── */

const thumbVariants = cn(
    "appearance-none",
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[2.5px] [&::-webkit-slider-thumb]:border-(--primary-600) [&::-webkit-slider-thumb]:shadow-[0_1px_3px_rgba(0,0,0,0.25)] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto",
    "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-[2.5px] [&::-moz-range-thumb]:border-(--primary-600) [&::-moz-range-thumb]:shadow-[0_1px_3px_rgba(0,0,0,0.25)] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto",
);

function PriceRangeSlider({
    min,
    max,
    step = 500,
    value,
    onChange,
}: {
    min: number;
    max: number;
    step?: number;
    value: [number, number];
    onChange: (v: [number, number]) => void;
}) {
    const [lo, hi] = value;
    const pct = (v: number) => ((v - min) / (max - min)) * 100;
    const setLo = (v: number) => onChange([Math.min(v, hi - step), hi]);
    const setHi = (v: number) => onChange([lo, Math.max(v, lo + step)]);

    return (
        <div>
            <div className="flex justify-between mb-2.5">
                <span className="text-[12.5px] font-semibold text-(--text)">
                    € {formatEUR(lo)}
                </span>
                <span className="text-[12.5px] text-(--fg-3)">–</span>
                <span className="text-[12.5px] font-semibold text-(--text)">
                    € {formatEUR(hi)}
                    {hi === max ? "+" : ""}
                </span>
            </div>
            <div className="relative h-4 flex items-center">
                <div className="absolute inset-x-0 h-1 rounded-full bg-(--border)" />
                <div
                    className="absolute h-1 rounded-full bg-(--primary-600)"
                    style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={lo}
                    onChange={(e) => setLo(Number(e.target.value))}
                    aria-label="Mindestpreis"
                    className={cn(
                        "absolute inset-0 w-full h-4 bg-transparent pointer-events-none",
                        thumbVariants,
                    )}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={hi}
                    onChange={(e) => setHi(Number(e.target.value))}
                    aria-label="Höchstpreis"
                    className={cn(
                        "absolute inset-0 w-full h-4 bg-transparent pointer-events-none",
                        thumbVariants,
                    )}
                />
            </div>
            <div className="flex justify-between mt-1.5">
                <span className="text-[11px] text-(--fg-3)">€ {formatEUR(min)}</span>
                <span className="text-[11px] text-(--fg-3)">
                    € {formatEUR(max)}+
                </span>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   FilterSidebar — the reusable component
   ══════════════════════════════════════════════════════════════════════ */

export function FilterSidebar({
    sections,
    value,
    onChange,
    onReset,
    onApply,
    activeCount,
    labels,
    className,
}: FilterSidebarProps) {
    const L = { ...DEFAULT_LABELS, ...labels };
    const count =
        activeCount ??
        sections.reduce((sum, s) => sum + sectionCount(s, value[s.id]), 0);

    return (
        <aside
            className={cn(
                "w-[288px] shrink-0 border-l border-(--border) bg-white flex flex-col h-full",
                className,
            )}
        >
            <div className="flex items-center justify-between px-5 pt-[18px] pb-3.5">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="size-[15px] text-(--primary-600)" />
                    <span className="text-[15px] font-semibold tracking-[-0.01em]">
                        {L.title}
                    </span>
                    {count > 0 && (
                        <span className="text-[11px] font-semibold text-white bg-(--primary-600) rounded-full px-[7px] py-0.5">
                            {count}
                        </span>
                    )}
                </div>
                {count > 0 && onReset && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="bg-transparent border-none cursor-pointer text-[12px] text-(--fg-3) font-sans hover:text-(--text) transition-colors"
                    >
                        {L.reset}
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-5">
                {sections.map((section) => {
                    const val = value[section.id];
                    return (
                        <FilterSection
                            key={section.id}
                            title={section.title}
                            count={sectionCount(section, val)}
                            defaultOpen={section.defaultOpen}
                        >
                            {section.kind === "pills" && (
                                <PillRow
                                    options={section.options}
                                    value={val as string}
                                    onChange={(v) => onChange(section.id, v)}
                                />
                            )}
                            {section.kind === "checkboxes" && (
                                <CheckboxFilterList
                                    items={section.items}
                                    values={val as Array<string>}
                                    searchable={section.searchable}
                                    placeholder={section.placeholder}
                                    noResults={L.noResults}
                                    onChange={(v) => onChange(section.id, v)}
                                />
                            )}
                            {section.kind === "price" && (
                                <PriceRangeSlider
                                    min={section.min}
                                    max={section.max}
                                    step={section.step}
                                    value={val as [number, number]}
                                    onChange={(v) => onChange(section.id, v)}
                                />
                            )}
                        </FilterSection>
                    );
                })}
            </div>

            <div className="p-5 pt-3.5 border-t border-(--border)">
                <button
                    type="button"
                    onClick={onApply}
                    className="w-full font-sans text-[13.5px] font-semibold text-white bg-(--primary-600) border-none rounded-md py-2.5 cursor-pointer hover:bg-(--primary-700) transition-colors duration-[130ms]"
                >
                    {count > 0
                        ? `${count} ${L.applyWithCount}`
                        : L.apply}
                </button>
            </div>
        </aside>
    );
}

export { FilterChip };
