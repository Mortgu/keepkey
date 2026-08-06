import { SearchBar, SortDropdown } from "@/components";
import type { SupplierFilter } from "../-hooks/use-supplier-filters";

interface Props {
    filters: SupplierFilter;
}

export default function SupplierFilters({ filters }: Props) {
    return (
        <div className="flex items-center gap-2">
            <SortDropdown value={filters.sort} onChange={filters.setSort} options={filters.sortOptions} />
            <SearchBar value={filters.searchQuery} onChange={filters.setSearchQuery} placeholder="Search suppliers..." />
        </div>
    )
}