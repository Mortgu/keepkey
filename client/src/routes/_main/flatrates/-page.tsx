import { Breadcrumbs, Button, Input } from "@/components";
import { useTranslation } from "react-i18next";
import FlatRateList from "./-components/flatrate-list";
import { useModal } from "@/hooks";
import FlatRateModal from "./-components/flatrate-modal";
import type { Flatrate } from "@keepit/schemas";

export default function FlatratePage() {
    const { t } = useTranslation();
    const modal = useModal<Flatrate>();

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
                <Input />

                <Button size="sm" onClick={() => modal.open()}>
                    {t("flatrates.create")}
                </Button>
            </div>

            <div className="">
                <FlatRateList onEdit={(flatrate) => modal.open(flatrate)} />
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