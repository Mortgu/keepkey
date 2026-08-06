import { SearchBar, SortDropdown } from "@/components";
import type { EmployeeFilter } from "../-hooks/use-employee-filters";

interface Props {
    filters: EmployeeFilter;
}

export default function EmployeeFilters({ filters }: Props) {
    return (
        <div className="flex items-center gap-2">
            <SortDropdown value={filters.sort} onChange={filters.setSort} options={filters.sortOptions} />
            <SearchBar value={filters.searchQuery} onChange={filters.setSearchQuery} placeholder="Search suppliers..." />
        </div>
    )
}