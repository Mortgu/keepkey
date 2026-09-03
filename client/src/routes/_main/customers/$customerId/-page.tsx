import { useState } from "react";
import { useTranslation } from "react-i18next";
import CustomerModal from "../-components/customer-modal";
import CustomerDetailPageHeader from "./-components/header";
import CustomerOffersTab from "./-components/tabs/customer-offers-tab";
import CustomerGeneralTab from "./-components/tabs/customer-general-tab";
import CustomerPricesTab from "./-components/tabs/customer-prices-tab";
import { Route } from "./index";
import type { Customer } from "@keepit/schemas";
import { Breadcrumbs, RouteError, Tabs } from "@/components";
import { useCustomer, useModal } from "@/hooks";

const TABS = [
    { value: "general", label: "Allgemein" },
    { value: "offers", label: "Angebote" },
    { value: "prices", label: "Preise" },
    { value: "orders", label: "Bestellungen" },
    { value: "invoices", label: "Rechnungen" },
];

export default function CustomerDetailPage() {
    const { t } = useTranslation();
    const { customerId } = Route.useParams();
    const { customer, isPending, error } = useCustomer(customerId);

    const modal = useModal<Customer>();
    const [tab, setTab] = useState<string>(TABS[0].value);

    if (error) return <div className="mx-4"><RouteError error={error} /></div>;
    if (isPending || !customer) return <div className="mx-4 p-4">Lädt…</div>;

    return (
        <div className="grid gap-4 mx-4">
            <div className="flex items-center justify-between gap-4 border-b border-(--border) h-14">
                <Breadcrumbs
                    size="sm"
                    maxItems={4}
                    items={[
                        { label: "Dashboard", to: "/" },
                        { label: t("section.customers"), to: "/customers" },
                        { label: customer.companyName },
                    ]}
                />
            </div>

            <CustomerDetailPageHeader customer={customer} onEdit={(c) => modal.open(c)} />

            <div className="w-full h-full flex">
                <div className="w-full flex-2  border-r border-(--border)">
                    <div className="h-[42px] px-8 border-b border-(--border)">
                        <Tabs tabs={TABS} value={tab} onChange={setTab} />
                    </div>

                    <div className="gap-4 px-8 py-6">
                        {tab === "general" && (
                            <CustomerGeneralTab customer={customer} />
                        )}

                        {tab === "offers" && (
                            <CustomerOffersTab customer={customer} />
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
