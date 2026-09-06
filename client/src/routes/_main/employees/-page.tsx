import { useTranslation } from "react-i18next";
import EmployeeList from "./-components/employee-list";
import UserModal from "./-components/user-modal";
import useEmployeeFilters from "./-hooks/use-employee-filters";
import type { User } from "@keepit/schemas";
import { Breadcrumbs, Button, SearchBar, SortDropdown } from "@/components";
import { useModal } from "@/hooks";

export default function EmployeePage() {
    const { t } = useTranslation();

    const modal = useModal<User>();
    const filters = useEmployeeFilters();

    return (
        <div className="grid gap-4 mx-4">
            <div className="flex items-center justify-between gap-4 border-b border-(--border) h-14">
                <Breadcrumbs
                    size="sm"
                    maxItems={4}
                    items={[
                        { label: "Dashboard", to: "/" },
                        { label: t("section.employees"), to: "/employees" },
                    ]}
                />
            </div>

            <div className="w-full flex items-center gap-2">
                <SortDropdown value={filters.sort} onChange={filters.setSort} options={filters.sortOptions} />
                <SearchBar value={filters.searchQuery} onChange={filters.setSearchQuery} placeholder={t("employees.searchPlaceholder")} />

                <Button size="sm" onClick={() => modal.open()}>
                    {t("employees.create")}
                </Button>
            </div>

            <EmployeeList filters={filters} onEdit={(user) => modal.open(user)} />

            {modal.isOpen && (
                <UserModal
                    key={modal.key}
                    onClose={modal.close}
                    currentEmployee={modal.data}
                />
            )}
        </div>
    )
}
