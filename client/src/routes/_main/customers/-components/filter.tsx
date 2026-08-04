import { t } from "i18next";
import type { CustomerFilters } from "../-page.hooks";
import { MultiDropdown, SearchBar } from "@/components";
import { COUNTRY_OPTIONS, LANGUAGE_OPTIONS } from "@/lib/countries";

interface Props {
    filters: CustomerFilters;
}

export default function CustomerPageFilters({ filters }: Props) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-(--border) p-4 px-8">
            <div className="flex items-center gap-2 flex-1">
                {/* <SortDropdown
                                value={filters.sort}
                                onChange={filters.setSort}
                                options={filters.sortOptions}
                            />*/}

                <MultiDropdown
                    label="Land"
                    options={COUNTRY_OPTIONS}
                    values={filters.countryFilter}
                    onChange={filters.setCountryFilter}
                />

                <MultiDropdown
                    label="Sprache"
                    options={LANGUAGE_OPTIONS}
                    values={filters.languageFilter}
                    onChange={filters.setLanguageFilter}
                />

                <SearchBar
                    className="flex-1"
                    value={filters.searchInput}
                    onChange={filters.setSearchInput}
                    onSubmit={() => { }}
                    placeholder={t("common.search")}
                />
            </div>
        </div>
    )
}