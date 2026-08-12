import { useOfferFilterOptions } from "../-hooks/use-offer-filter-options";
import OfferCard from "./card/offer-card";
import OfferModal from "./modals/offer-modal";
import type { OfferFilters } from "../-hooks/use-offer-filters";


import type { Offer } from "@keepit/schemas";
import { FilterChip, ListSkeleton, OfferCardSkeleton, RouteError } from "@/components";
import { useContacts, useCustomers, useLocale, useModal, useProducts } from "@/hooks";
import { useOffers } from "@/hooks/offers/offer-hooks";

interface Props {
  filters: OfferFilters;
}

export default function OfferList({ filters }: Props) {
  const modal = useModal<Offer>();

  const { items: offers, isPending, error } = useOffers(filters.params);

  const { contacts } = useContacts();
  const { customers } = useCustomers();
  const { products } = useProducts();

  const locale = useLocale();
  const { customerFilterOptions, contactPersonFilterOptions, productFilterOptions } = useOfferFilterOptions(customers, contacts, products, locale);

  if (error) return <RouteError error={error} />;

  return (
    <div className="grid grid-rows-[auto_1fr] h-full">
      <div className="grid gap-4 h-fit">
        {filters.activeFilterCount > 0 && (
          <div className="flex gap-2 w-fit flex-wrap">
            {filters.customerFilter.map((id) => {
              const option = customerFilterOptions.find((i) => i.value === id);
              if (!option) return null;
              return (
                <FilterChip
                  key={`customer-${id}`}
                  label="Kunde"
                  value={option.label}
                  onRemove={() => filters.removeCustomerFilter(id)}
                />
              );
            })}

            {filters.contactPersonFilter.map((id) => {
              const option = contactPersonFilterOptions.find((i) => i.value === id);
              if (!option) return null;
              return (
                <FilterChip
                  key={`contact-${id}`}
                  label="Kontakt"
                  value={option.label}
                  onRemove={() => filters.removeContactPersonFilter(id)}
                />
              );
            })}

            {filters.productFilter.map((id) => {
              const option = productFilterOptions.find((i) => i.value === id);
              if (!option) return null;
              return (
                <FilterChip
                  key={`product-${id}`}
                  label="Workload"
                  value={option.label}
                  onRemove={() => filters.removeProductFilter(id)}
                />
              );
            })}
          </div>
        )}

        <div className="grid gap-4">
          {isPending && (
            <ListSkeleton rows={6} skeleton={<OfferCardSkeleton />} />
          )}
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} onEdit={(o) => modal.open(o)} />
          ))}
        </div>

      </div>

      {modal.isOpen && (
        <OfferModal
          key={modal.key}
          closeFn={modal.close}
          sourceOffer={modal.data ?? undefined}
        />
      )}
    </div>
  );
}