import { useState } from "react";
import CustomerModal from "../-components/customer-modal";
import CustomerDetailPageHeader from "./-components/header";
import CustomerOffersTab from "./-components/tabs/customer-offers-tab";
import CustomerGeneralTab from "./-components/tabs/customer-general-tab";
import { Route } from "./index";
import type { Customer } from "@keepit/schemas";
import { PageWidth, RouteError } from "@/components";
import { useCustomer, useModal } from "@/hooks";
import { Tabs } from "@/components";

const TABS = [
    { value: "general", label: "Allgemein" },
    { value: "offers", label: "Angebote" },
    { value: "orders", label: "Bestellungen" },
    { value: "invoices", label: "Rechnungen" },
];

export default function CustomerDetailPage() {
    const { customerId } = Route.useParams();
    const { customer, isPending, error } = useCustomer(customerId);

    const modal = useModal<Customer>();
    const [tab, setTab] = useState<string>(TABS[0].value);

    if (error) return <PageWidth><RouteError error={error} /></PageWidth>;
    if (isPending || !customer) return <PageWidth><div className="p-4">Lädt…</div></PageWidth>;

    return (
        <PageWidth variant="none">
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
        </PageWidth>
    );
}
