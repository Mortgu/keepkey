import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import CustomerAutocomplete from "../../customers/-components/customer-autocomplete";
import { useCustomerFilters } from "../../customers/-page.hooks";
import OrderCreateModal from "./order-create-modal";
import { useOffers } from "@/hooks";
import { Button, Dialog } from "@/components";

export default function OrderModal() {
    const { t } = useTranslation();
    const { items: offers } = useOffers();
    const filters = useCustomerFilters();

    const [open, setOpen] = useState<boolean>(false);

    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
            trigger={<Button size="sm" icon={<Plus size={14} strokeWidth={2.5} />}>{t("button.create")}</Button>}
        >
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
                    <OrderCreateModal
                        key={offer.id}
                        offer={offer}
                        setOpen={setOpen}
                    />
                ))}
            </Dialog.Body>

            <Dialog.Footer>
                <Dialog.Close render={<Button variant="border" size="sm">{t("button.cancel")}</Button>} />
            </Dialog.Footer>
        </Dialog>
    );
}
