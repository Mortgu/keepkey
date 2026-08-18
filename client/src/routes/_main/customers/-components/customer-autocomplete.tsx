import { Input } from "@/components";
import { Autocomplete } from "@base-ui/react";
import { matchSorter } from 'match-sorter';
import { useTranslation } from "react-i18next";
import type { CustomerFilters } from "../-page.hooks";
import { Search } from "lucide-react";

export interface CustomerFuzzyItem {
    title: string;
    description: string;
}

interface Props {
    items: Array<CustomerFuzzyItem>;
    filters: CustomerFilters;
}

export default function CustomerAutocomplete({ items, filters }: Props) {
    const { t } = useTranslation();

    return (
        <Autocomplete.Root items={items} filter={fuzzyFilter} itemToStringValue={(item) => item.title} value={filters.searchInput} onValueChange={(val) => filters.setSearchInput(val)}>
            <div className="relative flex-1">
                <Autocomplete.Input placeholder={t("common.search")} render={
                    <Input rightIcon={<Search size={14} />} placeholder={t("common.search")} />
                } />
            </div>
            <Autocomplete.Portal>
                <Autocomplete.Positioner className="outline-hidden" sideOffset={4}>
                    <Autocomplete.Popup className="w-(--anchor-width) max-w-(--available-width) border border-(--border) bg-white text-neutral-950 rounded-md">
                        <Autocomplete.Empty>
                            <div className="py-3 pr-4 pl-2 text-sm leading-4 text-neutral-500">
                                No results found for "{<Autocomplete.Value />}"
                            </div>
                        </Autocomplete.Empty>

                        <Autocomplete.List className="flex max-h-[min(var(--available-height),28rem)] flex-col overflow-y-auto overscroll-contain py-1 scroll-pt-1 scroll-pb-1 empty:p-0">
                            {(item: CustomerFuzzyItem) => (
                                <Autocomplete.Item key={item.title} value={item} className="flex cursor-default py-3 pr-2 pl-2 text-sm leading-6 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:before:absolute data-highlighted:before:inset-x-0 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-100">
                                    <Autocomplete.Value>
                                        {(value) => (
                                            <span className="flex w-full flex-col gap-0">
                                                <span className="flex items-center justify-between gap-3">
                                                    <span className="flex-1 font-medium leading-5">
                                                        {highlightText(item.title, value)}
                                                    </span>
                                                </span>
                                                <span className="flex-1 text-sm text-gray-500 leading-5">
                                                    {highlightText(item.description, value)}
                                                </span>
                                            </span>
                                        )}
                                    </Autocomplete.Value>
                                </Autocomplete.Item>
                            )}
                        </Autocomplete.List>
                    </Autocomplete.Popup>
                </Autocomplete.Positioner>
            </Autocomplete.Portal>
        </Autocomplete.Root>
    )
}

function highlightText(text: string, query: string): React.ReactNode {
    const trimmed = query.trim();
    if (!trimmed) {
        return text;
    }

    const limited = trimmed.slice(0, 100);
    const escaped = limited.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');

    return text.split(regex).map((part, idx) =>
        regex.test(part) ? (
            <mark key={idx} className="bg-transparent font-bold text-(--primary-600) ">
                {part}
            </mark>
        ) : (
            part
        ),
    );
}

function fuzzyFilter(item: CustomerFuzzyItem, query: string): boolean {
    if (!query) return true;

    const results = matchSorter([item], query, {
        keys: [
            'title',
            { key: 'title', threshold: matchSorter.rankings.CONTAINS },
        ],
    });

    return results.length > 0;
}