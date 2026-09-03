import { useTranslation } from "react-i18next";
import OfferFilters from "./-components/offer-filters";
import OfferList from "./-components/offer-list";
import OfferModal from "./-components/modals/offer-modal";
import useOfferFilters from "./-hooks/use-offer-filters";
import { Breadcrumbs, Button } from "@/components";
import { useContacts, useCustomers, useModal, useProducts } from "@/hooks";

export function OfferPage() {
    const { t } = useTranslation();
    const modal = useModal();

    const filters = useOfferFilters();

    const { contacts } = useContacts();
    const { customers } = useCustomers();
    const { products } = useProducts();

    return (
        <div className="grid gap-4 mx-4">
            <div className="flex items-center justify-between gap-4 border-b border-(--border) h-14">
                <Breadcrumbs
                    size="sm"
                    maxItems={4}
                    items={[
                        { label: "Dashboard", to: "/" },
                        { label: t("section.offers"), to: "/offers" },
                    ]}
                />
            </div>

            <div className="flex items-center gap-2">
                <OfferFilters
                    filters={filters}
                    customers={customers}
                    contacts={contacts}
                    products={products}
                />

                <Button size="sm" onClick={() => modal.open()}>
                    {t("offers.create")}
                </Button>
            </div>

            <OfferList filters={filters} />

            {modal.isOpen && (
                <OfferModal key={modal.key} onClose={modal.close} />
            )}
        </div>
    );
}
