import { useTranslation } from "react-i18next";
import type { SupplierFilter } from "../-hooks/use-supplier-filters";
import { SearchBar, SortDropdown } from "@/components";

interface Props {
    filters: SupplierFilter;
}

export default function SupplierFilters({ filters }: Props) {
    const { t } = useTranslation();

    return (
        <div className="flex items-center gap-2">
            <SortDropdown value={filters.sort} onChange={filters.setSort} options={filters.sortOptions} />
            <SearchBar value={filters.searchQuery} onChange={filters.setSearchQuery} placeholder={t("suppliers.searchPlaceholder")} />
        </div>
    )
}