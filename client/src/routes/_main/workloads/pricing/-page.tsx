import { t } from "i18next";
import { LoaderCircle, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { useEffect } from "react";
import PricingTable from "./-components/pricing-table";
import { useTariffGroups } from "@/hooks";
import { Button, PageWidth } from "@/components";

export default function PricingPage() {
    const { groups, isPending, error } = useTariffGroups();

    useEffect(() => {
        if (error) {
            toast.error(error.message);
        }
    }, [error]);

    if (isPending) {
        return (
            <LoaderCircle className="size-4" />
        )
    }

    return (
        <PageWidth variant="constrained">
            <div className="grid gap-4">
                {/* Page header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-medium">{t('section.workloads')}</h1>
                </div>

                {/* Page header actions */}
                <div className="flex items-center justify-between gap-4">
                    <div></div>

                    <div className="flex items-center gap-2">
                        <Button onClick={() => { }} size="sm">
                            {t('button.create')} <Plus className="size-4" />
                        </Button>
                    </div>
                </div>

                {groups.map(group => (
                    <PricingTable key={group.id} group={group} />
                ))}
            </div>
        </PageWidth>
    )
}
