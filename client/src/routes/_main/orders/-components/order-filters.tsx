import { SearchBar, SortDropdown } from "@/components";
import type { OrderFilters } from "../-hooks/use-order-filters";

interface Props {
    filters: OrderFilters;
}

export default function OrderFilters({ filters }: Props) {
    return (
        <div className="flex items-center gap-2">
            <SortDropdown value={filters.sort} onChange={filters.setSort} options={filters.sortOptions} />
            <SearchBar value={filters.searchQuery} onChange={filters.setSearchQuery} placeholder="Orders durchsuchen..." />
        </div>
    )
}