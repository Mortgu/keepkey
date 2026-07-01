import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import OfferCard from "./card/offer-card";
import OfferModal from "./offer-modal";

import { Button, FilterChip, SearchBar } from "@/components";
import { MultiDropdown } from "@/components/filters/multi-dropdown";
import { SortDropdown } from "@/components/filters/sort-dropdown";
import { useContacts, useCustomers, useModal } from "@/hooks";
import { useOffers } from "@/hooks/offers/offer-hooks";
import type { ContactPerson, Customer, Offer } from "@/types";

const sort_options = [
  { value: "createdAt:desc", label: "Datum – neuestes zuerst" },
  { value: "createdAt:asc", label: "Datum – ältestes zuerst" },
];

export default function OfferList() {
  const { t } = useTranslation();

  const modal = useModal<Offer>();

  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState(sort_options[0].value);
  const [customerFilter, setCustomerFilter] = useState<Array<string>>([]);
  const [contactPersonFilter, setContactPersonFilter] = useState<Array<string>>(
    [],
  );

  const params = useMemo(() => ({
    search: searchInput || undefined,
    companyIds: customerFilter.length > 0 ? customerFilter : undefined,
    contactPersonIds: contactPersonFilter.length > 0 ? contactPersonFilter : undefined,
    sort,
  }), [searchInput, customerFilter, contactPersonFilter, sort]);

  const { offers } = useOffers(params);
  const { contacts } = useContacts();
  const { customers } = useCustomers();

  const customerFilterOptions = useMemo(
    () =>
      customers.map((c: Customer) => ({
        value: c.id,
        label: c.companyName,
      })),
    [customers],
  );

  const contactPersonFilterOptions = useMemo(
    () =>
      contacts.map((cp: ContactPerson) => ({
        value: cp.id,
        label: `${cp.firstName} ${cp.lastName}`,
      })),
    [contacts],
  );

  const activeFilterCount = customerFilter.length + contactPersonFilter.length;

  const handleSearch = () => {
    setSearchInput(searchInput);
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <div className="w-full flex items-center gap-4">
          <SortDropdown
            value={sort}
            onChange={setSort}
            options={sort_options}
          />

          <MultiDropdown
            label="Kunde"
            options={customerFilterOptions}
            values={customerFilter}
            onChange={setCustomerFilter}
          />

          <MultiDropdown
            label="Kontakt"
            options={contactPersonFilterOptions}
            values={contactPersonFilter}
            onChange={setContactPersonFilter}
          />

          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={handleSearch}
            placeholder={t("common.search")}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => modal.open()} size="sm">
            {t("button.create")} <Plus className="size-4" />
          </Button>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex gap-2 w-fit flex-wrap">
          {customerFilter.map((id) => {
            const option = customerFilterOptions.find((i) => i.value === id);
            if (!option) return null;
            return (
              <FilterChip
                key={`customer-${id}`}
                label="Kunde"
                value={option.label}
                onRemove={() =>
                  setCustomerFilter(customerFilter.filter((i) => i !== id))
                }
              />
            );
          })}

          {contactPersonFilter.map((id) => {
            const option = contactPersonFilterOptions.find(
              (i) => i.value === id,
            );
            if (!option) return null;
            return (
              <FilterChip
                key={`contact-${id}`}
                label="Kontakt"
                value={option.label}
                onRemove={() =>
                  setContactPersonFilter(
                    contactPersonFilter.filter((i) => i !== id),
                  )
                }
              />
            );
          })}
        </div>
      )}

      <div className="grid gap-2">
        {offers?.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            onEdit={(o) => modal.open(o)}
          />
        ))}
      </div>

      {modal.isOpen && (
        <OfferModal
          key={modal.key}
          onClose={modal.close}
          currentOffer={modal.data ?? undefined}
        />
      )}
    </>
  );
}
