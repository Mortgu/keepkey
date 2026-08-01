import { useTranslation } from "react-i18next";
import useOfferFilters from "../-hooks/use-offer-filters";
import { useOfferFilterOptions } from "../-hooks/use-offer-filter-options";
import OfferCard from "./card/offer-card";


import { FilterChip, ListSkeleton, MultiDropdown, OfferCardSkeleton, RouteError, SearchBar, SortDropdown } from "@/components";
import { useContacts, useCustomers, useLocale, useModal, useProducts } from "@/hooks";
import { useOffers } from "@/hooks/offers/offer-hooks";
import type { Offer } from "@keepit/schemas";
import OfferModal from "./modals/offer/offer-modal";

export default function OfferList() {
  const { t } = useTranslation();
  const modal = useModal<Offer>();

  const filters = useOfferFilters();
  const { items: offers, isPending, error } = useOffers(filters.params);

  const { contacts } = useContacts();
  const { customers } = useCustomers();
  const { products } = useProducts();

  const locale = useLocale();
  const { customerFilterOptions, contactPersonFilterOptions, productFilterOptions } = useOfferFilterOptions(customers, contacts, products, locale);

  if (error) return <RouteError error={error} />;

  return (
    <div className="bg-(--page-bg) grid grid-rows-[auto_1fr] h-full">

      <div className="flex items-center justify-between gap-4 px-8 py-4 border-b border-(--border) bg-white">
        <div className="flex items-center w-full gap-2">
          <SortDropdown value={filters.sort} onChange={filters.setSort} options={filters.sortOptions} />



          <MultiDropdown
            label="Kunde"
            options={customerFilterOptions}
            values={filters.customerFilter}
            onChange={filters.setCustomerFilter}
          />

          <MultiDropdown
            label="Kontakt"
            options={contactPersonFilterOptions}
            values={filters.contactPersonFilter}
            onChange={filters.setContactPersonFilter}
          />

          <MultiDropdown
            label="Workload"
            options={productFilterOptions}
            values={filters.productFilter}
            onChange={filters.setProductFilter}
          />

          <SearchBar
            className="flex-1"
            value={filters.searchInput}
            onChange={filters.setSearchInput}
            onSubmit={() => { }}
            placeholder={t("common.search")}
          />

        </div>
      </div>


      <div className="grid gap-4 px-8 py-6 h-fit">
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

        <div className="grid gap-2">
          {isPending && (
            <ListSkeleton rows={6} skeleton={<OfferCardSkeleton />} />
          )}
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} onEdit={(type, offer) => modal.open(offer)} />
          ))}
        </div>

      </div>

      {modal.isOpen && (
        <OfferModal
          key={modal.key}
          closeFn={modal.close}
          currentOffer={modal.data ?? undefined}
        />
      )}
    </div>
  );
}