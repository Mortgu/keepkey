import { Breadcrumbs, Button } from "@/components";
import { useContacts, useCustomers, useModal, useProducts } from "@/hooks";
import { useTranslation } from "react-i18next";
import useOfferFilters from "../../../components/modules/modals/offer/_hooks/use-offer-filters";
import OfferModal from "../../../components/modules/modals/offer/offer-modal";
import type { OfferModalMode } from "../../../components/modules/modals/offer/offer-modal-policy";
import OfferFilters from "./-components/offer-filters";
import OfferList from "./-components/offer-list";

export function OfferPage() {
    const { t } = useTranslation();
    const modal = useModal<{ mode: OfferModalMode }>();

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

                <Button size="sm" onClick={() => modal.open({ mode: "offer" })}>
                    {t("offers.create")}
                </Button>
                {/* Bestandsverträge ohne Ursprungsangebot im System. */}
                <Button size="sm" variant="secondary" onClick={() => modal.open({ mode: "renewal" })}>
                    {t("offers.createRenewal")}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => modal.open({ mode: "extension" })}>
                    {t("offers.createExtension")}
                </Button>
            </div>

            <OfferList filters={filters} />

            {modal.isOpen && (
                <OfferModal
                    key={modal.key}
                    mode={modal.data?.mode}
                    onClose={modal.close}
                />
            )}
        </div>
    );
}
