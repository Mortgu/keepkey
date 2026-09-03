import { useTranslation } from "react-i18next";
import FlatRateList from "./-components/flatrate-list";
import FlatRateModal from "./-components/flatrate-modal";
import useFlatrateFilters from "./-hooks/use-flatrate-filters";
import type { Flatrate } from "@keepit/schemas";
import { useModal } from "@/hooks";
import { Breadcrumbs, Button, Input, SortDropdown } from "@/components";

export default function FlatratePage() {
    const { t } = useTranslation();
    const modal = useModal<Flatrate>();

    const filters = useFlatrateFilters();

    return (
        <div className="grid gap-4 mx-4">
            <div className="flex items-center justify-between gap-4 border-b border-(--border) h-14">
                <Breadcrumbs
                    size="sm"
                    maxItems={4}
                    items={[
                        { label: "Dashboard", to: "/" },
                        { label: "Flatrates", to: "/flatrates" },
                    ]}
                />



            </div>

            <div className="flex items-center gap-4">
                <SortDropdown
                    value={filters.sort}
                    onChange={filters.setSort}
                    options={filters.sortOptions}
                />

                <Input
                    value={filters.searchInput}
                    onChange={(event) => filters.setSearchInput(event.target.value)}
                    placeholder={t("flatrates.search")}
                />

                <Button size="sm" onClick={() => modal.open()}>
                    {t("flatrates.create")}
                </Button>
            </div>

            <div className="">
                <FlatRateList filters={filters} onEdit={(flatrate) => modal.open(flatrate)} />
            </div>

            {modal.isOpen && (
                <FlatRateModal
                    key={modal.key}
                    onClose={modal.close}
                    currentFlatrate={modal.data}
                />
            )}
        </div>
    )
}