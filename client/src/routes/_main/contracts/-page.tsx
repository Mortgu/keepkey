import { useTranslation } from "react-i18next";
import ContractList from "./-components/contract-list";
import ContractModal from "./-components/contract-modal";
import type { Contract } from "@keepit/schemas";
import { Breadcrumbs, Button } from "@/components";
import { useModal } from "@/hooks";

export default function ContractPage() {
    const { t } = useTranslation();
    const modal = useModal<Contract>();

    return (
        <div className="grid gap-4 mx-4">
            <div className="flex items-center justify-between gap-4 border-b border-(--border) h-14">
                <Breadcrumbs
                    size="sm"
                    maxItems={4}
                    items={[
                        { label: "Dashboard", to: "/" },
                        { label: t("section.contracts"), to: "/contracts" },
                    ]}
                />
            </div>

            <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => modal.open()}>
                    {t("contracts.create")}
                </Button>
            </div>

            <ContractList onEdit={(contract) => modal.open(contract)} />

            {modal.isOpen && (
                <ContractModal
                    key={modal.key}
                    onClose={modal.close}
                    currentContract={modal.data}
                />
            )}
        </div>
    )
}
