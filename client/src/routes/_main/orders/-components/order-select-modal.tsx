import { Dot } from "lucide-react";
import { useTranslation } from "react-i18next";
import CustomerAutocomplete from "../../customers/-components/customer-autocomplete";
import { useCustomerFilters } from "../../customers/-page.hooks";
import OrderCreateModal from "./order-create-modal";
import type { Offer } from "@keepit/schemas";
import { useModal, useOffers } from "@/hooks";
import { Button, Dialog } from "@/components";
import { formatDate } from "@/lib/format";

interface Props {
    onClose: () => void;
}

export default function OrderModal({ onClose }: Props) {
    const { t } = useTranslation();
    const { items: offers } = useOffers();
    const filters = useCustomerFilters();

    const createModal = useModal<Offer>();

    return (
        <Dialog defaultOpen onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
            <Dialog.Header title="Bestellung für ---" />

            <Dialog.Toolbar>
                <CustomerAutocomplete
                    items={offers.map(offer => ({
                        title: offer.quoteId,
                        description: `${offer.customerContactPerson.firstName} ${offer.customerContactPerson.lastName}`
                    }))}
                    filters={filters}
                />
            </Dialog.Toolbar>

            <Dialog.Body className="gap-2">
                {offers.map(offer => (
                    <button
                        key={offer.id}
                        type="button"
                        className="w-full text-left border border-(--border) py-3 px-4 rounded-md cursor-pointer hover:bg-(--page-bg)"
                        onClick={() => createModal.open(offer)}
                    >
                        <span className="flex items-center gap-1">
                            <span className="text-md">[AG{offer.quoteId}]</span>
                            <span className="text-md">{offer.customer.companyName}</span>
                        </span>
                        <span className="flex items-center gap-0.5 text-sm">
                            <span>{offer.customerContactPerson.firstName} {offer.customerContactPerson.lastName}</span>
                            <Dot size={18} />
                            <span className="text-md">{formatDate(offer.createdAt)}</span>
                        </span>
                    </button>
                ))}
            </Dialog.Body>

            <Dialog.Footer>
                <Dialog.Close render={<Button variant="border" size="sm">{t("button.cancel")}</Button>} />
            </Dialog.Footer>

            {createModal.isOpen && createModal.data && (
                <OrderCreateModal
                    key={createModal.key}
                    offer={createModal.data}
                    onClose={createModal.close}
                    onCreated={() => { createModal.close(); onClose(); }}
                />
            )}
        </Dialog>
    );
}
