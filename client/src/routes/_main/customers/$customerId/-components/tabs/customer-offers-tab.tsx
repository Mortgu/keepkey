import type { Customer } from "@keepit/schemas";
import { useCustomerContacts, useProducts } from "@/hooks";
import OfferFilters from "@/routes/_main/offers/-components/offer-filters";
import OfferList from "@/routes/_main/offers/-components/offer-list";
import useOfferFilters from "@/routes/_main/offers/-hooks/use-offer-filters";

interface Props {
    customer: Customer;
}

export default function CustomerOffersTab({ customer }: Props) {
    const { products } = useProducts();
    const { contacts } = useCustomerContacts(customer.id);

    const filters = useOfferFilters({ customerId: customer.id });

    return (
        <div className="grid gap-4">
            <OfferFilters
                filters={filters}
                products={products}
                contacts={contacts}
            />

            <OfferList filters={filters} />
        </div>
    )
}
