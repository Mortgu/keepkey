import { ArrowLeft, Plus } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import OfferModal from "../../offers/-components/modals/offer/offer-modal";
import OrderModal from "../../orders/-components/order-modal";
import CustomerDetailHeader from "./-components/customer-detail-header";
import CustomerInvoicesTab from "./-components/customer-invoices-tab";
import CustomerOffersTab from "./-components/customer-offers-tab";
import CustomerOrdersTab from "./-components/customer-orders-tab";
import { Route } from "./index";
import type { Offer } from "@keepit/schemas";
import { Button, FilterTabBar, PageWidth, RouteError } from "@/components";
import { useCustomer, useModal } from "@/hooks";

const TABS = [
    { value: "offers", label: "Angebote" },
    { value: "orders", label: "Bestellungen" },
    { value: "invoices", label: "Rechnungen" },
];

export default function CustomerDetailPage() {
    const { customerId } = Route.useParams();
    const { tab } = Route.useSearch();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { customer, isPending, error } = useCustomer(customerId);

    const offerModal = useModal<Offer>();
    const orderModal = useModal<null>();

    if (error) return <PageWidth><RouteError error={error} /></PageWidth>;
    if (isPending || !customer) return <PageWidth><div className="p-4">Lädt…</div></PageWidth>;

    return (
        <PageWidth variant="none">
            <div className="p-4 border-b border-(--border)">
                <Link to="/customers" className="inline-flex items-center gap-1 text-sm text-(--text-secondary) hover:text-(--text)">
                    <ArrowLeft className="size-4" />
                    {t("section.customers")}
                </Link>
            </div>

            <div className="grid gap-4 p-4">
                <CustomerDetailHeader customer={customer} />

                <div className="flex items-center justify-between">
                    <FilterTabBar
                        tabs={TABS}
                        value={tab}
                        onChange={(value) => navigate({ to: "/customers/$customerId", params: { customerId }, search: { tab: value as "offers" | "orders" | "invoices" }, replace: true })}
                    />

                    <div className="flex items-center gap-2">
                        {tab === "offers" && (
                            <Button onClick={() => offerModal.open()} size="sm">
                                {t("button.create")} <Plus className="size-4" />
                            </Button>
                        )}
                        {tab === "orders" && (
                            <Button onClick={() => orderModal.open()} size="sm">
                                {t("button.create")} <Plus className="size-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {tab === "offers" && <CustomerOffersTab customerId={customerId} />}
                {tab === "orders" && <CustomerOrdersTab customerId={customerId} />}
                {tab === "invoices" && <CustomerInvoicesTab />}
            </div>

            {offerModal.isOpen && (
                <OfferModal
                    key={offerModal.key}
                    closeFn={offerModal.close}
                    currentOffer={offerModal.data ?? undefined}
                    preselectedCustomerId={customerId}
                />
            )}

            {orderModal.isOpen && (
                <OrderModal
                    key={orderModal.key}
                    onClose={orderModal.close}
                    customerId={customerId}
                />
            )}
        </PageWidth>
    );
}
