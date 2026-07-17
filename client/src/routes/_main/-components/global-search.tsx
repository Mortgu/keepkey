import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Clock, FileText, Search, ShoppingCart, Users, X } from "lucide-react";
import { tv } from "tailwind-variants";
import type { SearchResultItem, SearchType } from "@/data/search";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { useSearch } from "@/hooks/use-search";

const RECENT_KEY = "keepit:recent-searches";
const RECENT_MAX = 5;
const DEBOUNCE_MS = 250;

type TabKey = "all" | SearchType;

const TYPE_ICON: Record<SearchType, React.ReactNode> = {
    offer: <FileText size={15} />,
    order: <ShoppingCart size={15} />,
    customer: <Users size={15} />,
};

const TYPE_COLOR: Record<SearchType, string> = {
    offer: "text-[#00683F]",
    order: "text-[#8A5FBF]",
    customer: "text-[#4B7CBF]",
};

const TYPE_LABEL_KEY: Record<SearchType, string> = {
    offer: "dashboard.search.typeLabels.offer",
    order: "dashboard.search.typeLabels.order",
    customer: "dashboard.search.typeLabels.customer",
};

const TYPE_ROUTE: Record<SearchType, string> = {
    offer: "/offers",
    order: "/orders",
    customer: "/customers",
};

const inputWrap = tv({
    base: [
        "flex items-center gap-2.5 px-3 py-2",
        "bg-white rounded-lg border transition-[border-color,box-shadow] duration-100",
    ],
    variants: {
        open: {
            true: "border-(--primary) shadow-[0_0_0_3px_rgba(0,104,63,0.12)]",
            false: "border-(--border)",
        },
    },
});

const tabBtn = tv({
    base: "flex items-center gap-1.5 text-[12.5px] py-1.5 px-2.5 bg-none border-none cursor-pointer transition-colors duration-100",
    variants: {
        active: {
            true: "font-semibold text-(--text)",
            false: "font-medium text-(--text-secondary)",
        },
    },
});

const tabCount = tv({
    base: "text-[10.5px] font-semibold px-[5px] py-0 rounded-full",
    variants: {
        active: {
            true: "bg-(--primary-50) text-(--primary-600)",
            false: "bg-(--page-bg) text-(--text-secondary)",
        },
    },
});

const recentRow =
    "flex items-center gap-2.5 px-4 py-1.5 cursor-pointer text-[13px] text-(--text-600) hover:bg-(--page-bg) transition-colors";

function highlight(text: string, q: string): React.ReactNode {
    if (!q) return text;
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return text;
    return (
        <>
            {text.slice(0, i)}
            <mark className="bg-(--primary-100) text-(--primary-600) rounded-[2px] px-px">
                {text.slice(i, i + q.length)}
            </mark>
            {text.slice(i + q.length)}
        </>
    );
}

function formatRelativeDate(iso: string, t: (k: string, opts?: Record<string, unknown>) => string): string {
    const now = Date.now();
    const then = new Date(iso).getTime();
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60_000);
    const diffH = Math.floor(diffMin / 60);
    const diffD = Math.floor(diffH / 24);
    if (diffMin < 1) return t("dashboard.search.justNow");
    if (diffMin < 60) return t("dashboard.search.minutesAgo", { count: diffMin });
    if (diffH < 24) return t("dashboard.search.hoursAgo", { count: diffH });
    if (diffD < 7) return t("dashboard.search.daysAgo", { count: diffD });
    return new Date(iso).toLocaleDateString();
}

function loadRecent(): Array<string> {
    try {
        const raw = localStorage.getItem(RECENT_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string").slice(0, RECENT_MAX) : [];
    } catch {
        return [];
    }
}

function saveRecent(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    const current = loadRecent().filter((x) => x !== trimmed);
    const next = [trimmed, ...current].slice(0, RECENT_MAX);
    try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
        // ignore quota errors
    }
}

function ResultRow({ item, query }: { item: SearchResultItem; query: string }) {
    const { t } = useTranslation();
    return (
        <div
            className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-(--page-bg) transition-colors"
            // hover handled via Tailwind
        >
            <div
                className={`size-[30px] rounded-[7px] bg-(--page-bg) flex items-center justify-center shrink-0 ${TYPE_COLOR[item.type]}`}
            >
                {TYPE_ICON[item.type]}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-medium text-(--text) whitespace-nowrap overflow-hidden text-ellipsis">
                    {highlight(item.title, query)}
                </div>
                <div className="text-xs text-(--text-secondary) mt-px whitespace-nowrap overflow-hidden text-ellipsis">
                    {t(TYPE_LABEL_KEY[item.type])} · {highlight(item.meta, query)}
                </div>
            </div>
            <div className="text-[11px] text-(--text-secondary) shrink-0">
                {formatRelativeDate(item.updatedAt, t)}
            </div>
        </div>
    );
}

export default function GlobalSearch() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [tab, setTab] = useState<TabKey>("all");
    const recent = open ? loadRecent() : [];

    const wrapRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

    const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);
    const trimmedDebounced = debouncedQuery.trim();

    const activeType: SearchType | undefined = tab === "all" ? undefined : tab;
    const { data, isFetching } = useSearch(trimmedDebounced, activeType, {
        enabled: open,
    });

    // Outside-click close
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Tab indicator animation
    useLayoutEffect(() => {
        const el = tabRefs.current[tab];
        if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }, [tab, open]);

    const tabs: Array<{ key: TabKey; label: string }> = useMemo(
        () => [
            { key: "all", label: t("dashboard.search.tabs.all") },
            { key: "offer", label: t("dashboard.search.tabs.offers") },
            { key: "order", label: t("dashboard.search.tabs.orders") },
            { key: "customer", label: t("dashboard.search.tabs.customers") },
        ],
        [t],
    );

    const counts = data?.counts ?? { all: 0, offer: 0, order: 0, customer: 0 };
    const items = data?.items ?? [];
    const showRecent = trimmedDebounced.length === 0;
    const showEmpty = trimmedDebounced.length > 0 && items.length === 0 && !isFetching;

    const navigateToResult = (item: SearchResultItem) => {
        saveRecent(item.title);
        setOpen(false);
        navigate({
            to: TYPE_ROUTE[item.type],
            search: { search: item.searchValue },
        } as never);
    };

    const openFirstResult = () => {
        if (items.length > 0) {
            navigateToResult(items[0]);
        } else if (trimmedDebounced.length > 0) {
            saveRecent(trimmedDebounced);
        }
    };

    const handleRecentClick = (term: string) => {
        setQuery(term);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setOpen(false);
        } else if (e.key === "Enter" && items.length > 0) {
            e.preventDefault();
            openFirstResult();
        }
    };

    return (
        <div ref={wrapRef} className="relative w-full">
            <div className={inputWrap({ open })}>
                <span className="flex text-(--text-secondary) shrink-0">
                    <Search size={15} />
                </span>
                <input
                    ref={inputRef}
                    value={query}
                    onFocus={() => setOpen(true)}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={t("dashboard.search.placeholder")}
                    className="flex-1 border-none outline-none font-inherit text-[13.5px] text-(--text) bg-transparent"
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => setQuery("")}
                        className="flex bg-none border-none cursor-pointer text-(--text-secondary) p-0.5 rounded shrink-0"
                        aria-label={t("common.clear")}
                    >
                        <X size={13} />
                    </button>
                )}
                {!query && (
                    <span className="text-[11px] text-(--text-secondary) border border-(--border) rounded px-1.5 py-px shrink-0">
                        ⌘K
                    </span>
                )}
            </div>

            {open && (
                <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-white border border-(--border) rounded-[10px] shadow-[0_12px_32px_rgba(0,0,0,0.14)] overflow-hidden">
                    {/* Tabs */}
                    <div className="relative flex gap-0.5 px-2.5 pt-2 border-b border-(--border)">
                        {tabs.map((tb) => {
                            const on = tab === tb.key;
                            const count = counts[tb.key];
                            return (
                                <button
                                    key={tb.key}
                                    ref={(el) => {
                                        tabRefs.current[tb.key] = el;
                                    }}
                                    type="button"
                                    onClick={() => setTab(tb.key)}
                                    className={tabBtn({ active: on })}
                                >
                                    {tb.label}
                                    <span className={tabCount({ active: on })}>{count}</span>
                                </button>
                            );
                        })}
                        {indicator && (
                            <span
                                className="absolute bottom-[-1px] h-0.5 bg-(--primary-600) rounded-[2px] transition-[left,width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
                                style={{ left: indicator.left, width: indicator.width }}
                            />
                        )}
                    </div>

                    {/* Body */}
                    <div className="max-h-[340px] overflow-y-auto py-1.5">
                        {showRecent && (
                            <>
                                <div className="px-4 pt-2 pb-1 text-[10px] font-semibold text-(--text-secondary) uppercase tracking-[0.06em]">
                                    {t("dashboard.search.recent")}
                                </div>
                                {recent.length === 0 ? (
                                    <div className="px-4 py-3 text-[13px] text-(--text-secondary)">
                                        {t("dashboard.search.recentEmpty")}
                                    </div>
                                ) : (
                                    recent.map((r) => (
                                        <div
                                            key={r}
                                            onClick={() => handleRecentClick(r)}
                                            className={recentRow}
                                        >
                                            <span className="flex text-(--text-secondary)">
                                                <Clock size={13} />
                                            </span>
                                            {r}
                                        </div>
                                    ))
                                )}
                            </>
                        )}

                        {!showRecent && !showEmpty && items.map((item) => (
                            <div
                                key={`${item.type}-${item.id}`}
                                onClick={() => navigateToResult(item)}
                            >
                                <ResultRow item={item} query={trimmedDebounced} />
                            </div>
                        ))}

                        {showEmpty && (
                            <div className="flex flex-col items-center gap-2 py-9 px-4 text-(--text-secondary)">
                                <Search size={30} />
                                <div className="text-[13px] text-(--text-600)">
                                    {t("dashboard.search.empty", { query: trimmedDebounced })}
                                </div>
                            </div>
                        )}
                    </div>

                    {!showRecent && items.length > 0 && (
                        <div className="border-t border-(--border) px-4 py-2 text-[11.5px] text-(--text-secondary) flex justify-between">
                            <span>
                                {t("dashboard.search.results", { count: items.length })}
                            </span>
                            <span>{t("dashboard.search.hints")}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
