import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Clock, LoaderCircle, Search, X } from "lucide-react";
import { tv } from "tailwind-variants";
import SearchResultRow from "./-components/search-result-row";
import { loadRecent, saveRecent } from "./-search-recents";
import { Route } from "./index";
import type { SearchResultItem, SearchType } from "@keepit/schemas";
import { Breadcrumbs } from "@/components";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { useSearch } from "@/hooks/search/search-hooks";

const DEBOUNCE_MS = 250;

type TabKey = "all" | SearchType;

const TYPE_ROUTE: Record<SearchType, string> = {
    offer: "/offers",
    order: "/orders",
    customer: "/customers",
};

const tabBtn = tv({
    base: "flex items-center gap-1.5 text-[13px] py-2 px-3 cursor-pointer border-b-2 transition-colors",
    variants: {
        active: {
            true: "font-semibold text-(--text) border-(--primary-600)",
            false: "font-medium text-(--text-secondary) border-transparent hover:text-(--text)",
        },
    },
});

const tabCount = tv({
    base: "text-[10.5px] font-semibold px-[5px] rounded-full",
    variants: {
        active: {
            true: "bg-(--primary-50) text-(--primary-600)",
            false: "bg-(--page-bg) text-(--text-secondary)",
        },
    },
});

/**
 * Die Suche als eigene Seite.
 *
 * Vorher lag dieselbe Suche als Aufklapp-Feld auf dem Dashboard und auf der
 * Workload-Seite. Als Seite ist sie verlinkbar, der Begriff steht in der URL,
 * und es gibt sie nur noch einmal statt auf jeder Seite, die eine Suche
 * gebrauchen konnte.
 */
export default function SearchPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { q } = Route.useSearch();

    const [query, setQuery] = useState(q ?? "");
    const [tab, setTab] = useState<TabKey>("all");
    const inputRef = useRef<HTMLInputElement>(null);

    const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);
    const trimmed = debouncedQuery.trim();

    const activeType: SearchType | undefined = tab === "all" ? undefined : tab;
    const { data, isFetching } = useSearch(trimmed, activeType);

    // Der Begriff gehört in die URL: die Seite bleibt teilbar, und der
    // Zurück-Knopf führt zur vorigen Suche statt aus der Seite heraus.
    useEffect(() => {
        navigate({
            to: "/search",
            search: trimmed ? { q: trimmed } : {},
            replace: true,
        });
    }, [trimmed, navigate]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const counts = data?.counts ?? { all: 0, offer: 0, order: 0, customer: 0 };
    const items = data?.items ?? [];

    const showRecent = trimmed.length === 0;
    const showEmpty = trimmed.length > 0 && items.length === 0 && !isFetching;
    const recent = showRecent ? loadRecent() : [];

    const openResult = (item: SearchResultItem) => {
        saveRecent(item.searchValue);
        navigate({ to: TYPE_ROUTE[item.type], search: { search: item.searchValue } } as never);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Enter" && items.length > 0) {
            event.preventDefault();
            openResult(items[0]);
        }
    };

    const tabs: Array<{ key: TabKey; label: string }> = [
        { key: "all", label: t("search.tabs.all") },
        { key: "offer", label: t("search.tabs.offers") },
        { key: "order", label: t("search.tabs.orders") },
        { key: "customer", label: t("search.tabs.customers") },
    ];

    return (
        <div className="grid gap-4 mx-4">
            <div className="flex items-center justify-between gap-4 border-b border-(--border) h-14">
                <Breadcrumbs
                    size="sm"
                    maxItems={4}
                    items={[
                        { label: "Dashboard", to: "/" },
                        { label: t("search.title"), to: "/search" },
                    ]}
                />
            </div>

            <div className="flex items-center gap-4">
                <div className="flex flex-1 items-center gap-2.5 px-3 py-2 bg-white rounded-md border border-(--border) focus-within:border-(--primary) focus-within:shadow-[0_0_0_3px_rgba(0,104,63,0.12)] transition-[border-color,box-shadow] duration-100">
                    <span className="flex text-(--text-secondary) shrink-0">
                        <Search size={16} />
                    </span>

                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t("search.placeholder")}
                        className="flex-1 border-none outline-none text-sm text-(--text) bg-transparent"
                    />

                    {isFetching && <LoaderCircle size={14} className="animate-spin text-(--text-secondary) shrink-0" />}

                    {query && (
                        <button
                            type="button"
                            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                            className="flex cursor-pointer text-(--text-secondary) p-0.5 rounded shrink-0"
                            aria-label={t("common.clear")}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div className="border border-(--border) rounded-md bg-white overflow-hidden">
                    <div className="flex gap-1 px-3 border-b border-(--border)">
                        {tabs.map((entry) => (
                            <button
                                key={entry.key}
                                type="button"
                                onClick={() => setTab(entry.key)}
                                className={tabBtn({ active: tab === entry.key })}
                            >
                                {entry.label}
                                <span className={tabCount({ active: tab === entry.key })}>
                                    {counts[entry.key]}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="py-1.5">
                        {showRecent && (
                            <>
                                <p className="px-4 pt-2 pb-1 text-[10px] font-semibold text-(--text-secondary) uppercase tracking-[0.06em]">
                                    {t("search.recent")}
                                </p>

                                {recent.length === 0 ? (
                                    <p className="px-4 py-3 text-sm text-(--text-secondary)">
                                        {t("search.recentEmpty")}
                                    </p>
                                ) : recent.map((term) => (
                                    <button
                                        key={term}
                                        type="button"
                                        onClick={() => { setQuery(term); inputRef.current?.focus(); }}
                                        className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-sm text-(--text-600) cursor-pointer hover:bg-(--page-bg) transition-colors"
                                    >
                                        <Clock size={14} className="text-(--text-secondary)" />
                                        {term}
                                    </button>
                                ))}
                            </>
                        )}

                        {!showRecent && !showEmpty && items.map((item) => (
                            <SearchResultRow
                                key={`${item.type}-${item.id}`}
                                item={item}
                                query={trimmed}
                                onSelect={() => openResult(item)}
                            />
                        ))}

                        {showEmpty && (
                            <div className="flex flex-col items-center gap-2 py-12 px-4 text-(--text-secondary)">
                                <Search size={30} />
                                <p className="text-sm text-(--text-600)">
                                    {t("search.empty", { query: trimmed })}
                                </p>
                            </div>
                        )}
                    </div>

                {!showRecent && items.length > 0 && (
                    <div className="border-t border-(--border) px-4 py-2 text-[11.5px] text-(--text-secondary) flex justify-between">
                        <span>{t("search.results", { count: items.length })}</span>
                        <span>{t("search.hints")}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
