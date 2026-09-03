import { useTranslation } from "react-i18next";
import type { EmployeeFilter } from "../-hooks/use-employee-filters";
import { SearchBar, SortDropdown } from "@/components";

interface Props {
    filters: EmployeeFilter;
}

export default function EmployeeFilters({ filters }: Props) {
    const { t } = useTranslation();

    return (
        <div className="flex items-center gap-2">
            <SortDropdown value={filters.sort} onChange={filters.setSort} options={filters.sortOptions} />
            <SearchBar value={filters.searchQuery} onChange={filters.setSearchQuery} placeholder={t("employees.searchPlaceholder")} />
        </div>
    )
}