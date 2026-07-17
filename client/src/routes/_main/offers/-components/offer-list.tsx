import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import useOfferFilters from "../-hooks/use-offer-filters";
import { useOfferFilterOptions } from "../-hooks/use-offer-filter-options";
import OfferCard from "./card/offer-card";
import OfferModal from "./offer-modal";

import type { Offer } from "@/types";
import { Button, FilterChip, ListSkeleton, OfferCardSkeleton, RouteError, SearchBar } from "@/components";
import { MultiDropdown } from "@/components/filters/multi-dropdown";
import { SortDropdown } from "@/components/filters/sort-dropdown";
import { useContacts, useContracts, useCustomers, useLocale, useModal, useProductHook, useSupplierHook, useUserHook } from "@/hooks";
import { useOffers } from "@/hooks/offers/offer-hooks";

export default function OfferList() {
  const { t } = useTranslation();
  const modal = useModal<Offer>();

  const filters = useOfferFilters();
  const { items: offers, isPending, error } = useOffers(filters.params);

  const { contacts } = useContacts();
  const { customers } = useCustomers();
  const { suppliers } = useSupplierHook();
  const { users } = useUserHook();
  const { products } = useProductHook();
  const { contracts } = useContracts();

  const locale = useLocale();
  const { customerFilterOptions, contactPersonFilterOptions, productFilterOptions } = useOfferFilterOptions(customers, contacts, products, locale);

  if (error) return <RouteError error={error} />;

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <div className="w-full flex items-center gap-4">
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
            value={filters.searchInput}
            onChange={filters.setSearchInput}
            onSubmit={() => { }}
            placeholder={t("common.search")}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => modal.open()} size="sm">
            {t("button.create")} <Plus className="size-4" />
          </Button>
        </div>
      </div>

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
          <OfferCard key={offer.id} offer={offer} onEdit={(o) => modal.open(o)} />
        ))}
      </div>

      {modal.isOpen && (
        <OfferModal
          key={modal.key}
          closeFn={modal.close}
          currentOffer={modal.data ?? undefined}
          customers={customers}
          suppliers={suppliers}
          users={users}
          products={products}
          contracts={contracts}
        />
      )}
    </>
  );
}