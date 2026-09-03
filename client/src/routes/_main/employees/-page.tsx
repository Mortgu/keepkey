import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import EmployeeList from "./-components/employee-list";
import UserModal from "./-components/user-modal";
import useEmployeeFilters from "./-hooks/use-employee-filters";
import EmployeeFilters from "./-components/employee-filters";
import type { User } from "@keepit/schemas";
import { useModal } from "@/hooks";
import { Button, PageWidth } from "@/components";

export default function EmployeePage() {
    const { t } = useTranslation();

    const modal = useModal<User>();

    const filters = useEmployeeFilters();

    return (
        <PageWidth variant="none">
            <div className="bg-white border-b border-(--border) px-8 py-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex-1 grid gap-1">
                        <h1 className="font-medium text-xl">{t("section.employees")}</h1>
                        <h1 className="font-light text-sm text-gray-400">{t("employees.description")}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button icon={<Plus size={14} strokeWidth={3} />} variant="primary" size="sm"
                            onClick={() => modal.open()}>{t("button.create")}</Button>
                    </div>
                </div>
            </div>

            <div className="px-8 py-4 border-b border-(--border)">
                <EmployeeFilters filters={filters} />
            </div>

            <div className="px-8 py-6">
                <EmployeeList filters={filters} onEdit={(user) => modal.open(user)} />
            </div>

            {modal.isOpen && (
                <UserModal
                    key={modal.key}
                    onClose={modal.close}
                    currentEmployee={modal.data}
                />
            )}

        </PageWidth>
    )
}