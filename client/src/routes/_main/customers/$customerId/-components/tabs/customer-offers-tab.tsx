import type { Customer } from "@keepit/schemas";
import { useCustomerContacts, useProducts } from "@/hooks";
import { useModals } from "@/context/modal-context";
import OfferFilters from "@/routes/_main/offers/-components/offer-filters";
import OfferList from "@/routes/_main/offers/-components/offer-list";
import useOfferFilters from "@/routes/_main/offers/-hooks/use-offer-filters";
import { Button } from "@/components";

interface Props {
    customer: Customer;
}

export default function CustomerOffersTab({ customer }: Props) {
    const { products } = useProducts();
    const { contacts } = useCustomerContacts(customer.id);

    const { openModal } = useModals();
    const filters = useOfferFilters({ customerId: customer.id });

    return (
        <div className="grid gap-4">
            <div className="flex items-center justify-center gap-4">
                <OfferFilters
                    filters={filters}
                    products={products}
                    contacts={contacts}
                />

                <Button size="sm" className="whitespace-nowrap" onClick={() => openModal("offer", { preselectedCustomerId: customer.id })}>Angebot erstellen</Button>
            </div>

            <OfferList filters={filters} />
        </div>
    )
}
