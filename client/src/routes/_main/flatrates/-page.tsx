import { Button, PageWidth } from "@/components";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import FlatRateList from "./-components/flatrate-list";
import { useModal } from "@/hooks";
import { Fragment } from "react/jsx-runtime";
import FlatRateModal from "./-components/flatrate-modal";
import type { Flatrate } from "@keepit/schemas";

export default function FlatratePage() {
    const { t } = useTranslation();
    const modal = useModal<Flatrate>();

    return (
        <Fragment>
            <PageWidth variant="none">
                <div className="grid gap-4 px-8 py-6 border-b border-(--border)">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 grid gap-1">
                            <h1 className="font-medium text-xl">{t("section.flatRates")}</h1>
                            <p className="font-light text-sm text-gray-400">
                                Zentrale Flat Rate verwaltung
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* <Button icon={<Download size={14} />} variant="border" size="sm">
                        {t("button.export")}
                    </Button>*/}
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
                    <FlatRateList onEdit={(flatrate) => modal.open(flatrate)} />
                </div>
            </PageWidth>

            {modal.isOpen && (
                <FlatRateModal
                    key={modal.key}
                    onClose={modal.close}
                    currentFlatrate={modal.data}
                />
            )}
        </Fragment>
    )
}