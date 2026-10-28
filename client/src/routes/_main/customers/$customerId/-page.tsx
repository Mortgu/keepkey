import { Breadcrumbs, RouteError, Spinner, Tabs } from "@/components";
import { useCustomer, useModal } from "@/hooks";
import type { TranslationKey } from "@/i18n";
import type { Customer } from "@keepit/schemas";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import CustomerModal from "../-components/customer-modal";
import CustomerFlowTab from "./-components/tabs/customer-flow-tab";
import CustomerGeneralTab from "./-components/tabs/customer-general-tab";
import CustomerPricesTab from "./-components/tabs/customer-prices-tab";
import { Route } from "./index";

const TABS = [
    { value: "general", labelKey: "customer.detail.tabs.general" },
    { value: "flow", labelKey: "customer.detail.tabs.flow" },
    { value: "prices", labelKey: "customer.detail.tabs.prices" },
] as const satisfies ReadonlyArray<{ value: string; labelKey: TranslationKey }>;

export default function CustomerDetailPage() {
    const { t } = useTranslation();
    const { customerId } = Route.useParams();
    const { customer, isPending, error } = useCustomer(customerId);
    const { tab } = Route.useSearch();
    const navigate = useNavigate();

    const modal = useModal<Customer>();

    const handleTabChange = (value: string) => {
        void navigate({
            to: "/customers/$customerId",
            params: { customerId },
            search: (prev) => ({ ...prev, tab: value as typeof tab }),
        });
    };

    if (error) return <div className="mx-4"><RouteError error={error} /></div>;
    if (isPending || !customer) return <div className="mx-4 p-4"><Spinner /></div>;

    return (
        <div className="grid mx-4">
            <div className="flex items-center justify-between gap-4 border-b border-(--border) h-14">
                <Breadcrumbs
                    size="sm"
                    maxItems={4}
                    items={[
                        { label: t("nav.dashboard"), to: "/" },
                        { label: t("section.customers"), to: "/customers" },
                        { label: customer.companyName },
                    ]}
                />
            </div>

            <div className="w-full h-full flex">
                <div className="w-full flex-2">
                    <div className="h-[42px] border-b border-(--border)">
                        <Tabs
                            tabs={TABS.map(({ value, labelKey }) => ({ value, label: t(labelKey) }))}
                            value={tab}
                            onChange={handleTabChange}
                        />
                    </div>

                    <div className="gap-4 py-6">
                        {tab === "general" && (
                            <CustomerGeneralTab customer={customer} />
                        )}

                        {tab === "flow" && (
                            <CustomerFlowTab customerId={customer.id} />
                        )}

                        {tab === "prices" && (
                            <CustomerPricesTab customer={customer} />
                        )}
                    </div>
                </div>


            </div>

            {modal.isOpen && (
                <CustomerModal
                    key={modal.key}
                    currentCustomer={modal.data}
                    onClose={modal.close}
                />
            )}
        </div>
    );
}
