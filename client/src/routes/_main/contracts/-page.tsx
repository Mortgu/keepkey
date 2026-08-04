import { Button, PageWidth } from "@/components";
import ContractList from "./-components/contract-list";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useModal } from "@/hooks";
import type { Contract } from "@keepit/schemas";
import { Fragment } from "react/jsx-runtime";
import ContractModal from "./-components/contract-modal";

export default function ContractPage({ }) {
    const { t } = useTranslation();
    const modal = useModal<Contract>();

    return (
        <Fragment>
            <PageWidth variant="none">
                {/* Header */}
                <div className="grid gap-4 px-8 py-6 border-b border-(--border)">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 grid gap-1">
                            <h1 className="font-medium text-xl">{t("section.contracts")}</h1>
                            <p className="font-light text-sm text-gray-400">
                                Zentrale Tarif verwaltung
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                icon={<Plus size={14} strokeWidth={3} />}
                                variant="primary"
                                size="sm"
                                onClick={() => modal.open()}
                            >
                                {t("button.create")}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6">
                    <ContractList onEdit={(contract) => modal.open(contract)} />
                </div>
            </PageWidth>

            {modal.isOpen && (
                <ContractModal
                    key={modal.key}
                    onClose={modal.close}
                    currentContract={modal.data}
                />
            )}
        </Fragment>
    )
}