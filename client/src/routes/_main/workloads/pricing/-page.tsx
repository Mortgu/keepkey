import { PageWidth } from "@/components";
import PricingTable from "./-components/pricing-table";
import { t } from "i18next";

export default function PricingPage() {

    return (
        <PageWidth variant="constrained">
            <div className="grid gap-4">
                {/* Page header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-medium">{t('section.workloads')}</h1>
                </div>

                <PricingTable />
            </div>
        </PageWidth>
    )
}