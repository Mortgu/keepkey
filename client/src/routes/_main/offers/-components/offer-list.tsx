import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import OfferModal from "./offer-modal";
import { useCustomerHook, useOfferHook } from "@/hooks";
import OfferListItem from "./offer-list-item";

import type { ContactPerson, Customer, Offer } from "@/types";
import { Button, FilterChip, SearchBar } from "@/components";
import { MultiDropdown } from "@/components/filters/multi-dropdown";
import { SortDropdown } from "@/components/filters/sort-dropdown";

const sort_options = [
  { value: "createdAt:desc", label: "Datum – neuestes zuerst" },
  { value: "createdAt:asc", label: "Datum – ältestes zuerst" },
];

export default function OfferList() {
  const [editing, setEditing] = useState<Offer | null | undefined>(undefined);

  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState(sort_options[0].value);
  const [customerFilter, setCustomerFilter] = useState<string[]>([]);
  const [contactPersonFilter, setContactPersonFilter] = useState<string[]>([]);

  const params = useMemo(() => ({
    search: searchInput || undefined,
    companyIds: customerFilter.length > 0 ? customerFilter : undefined,
    contactPersonIds: contactPersonFilter.length > 0 ? contactPersonFilter : undefined,
    sort,
  }), [searchInput, customerFilter, contactPersonFilter, sort]);

  const { offers, contactPersons } = useOfferHook(params);
  const { customers } = useCustomerHook();

  const customerFilterOptions = useMemo(() =>
    customers.map((c: Customer) => ({
      value: c.id,
      label: c.companyName,
    })),
    [customers]);

  const contactPersonFilterOptions = useMemo(() =>
    contactPersons.map((cp: ContactPerson) => ({
      value: cp.id,
      label: `${cp.firstName} ${cp.lastName}`,
    })),
    [contactPersons]);

  const activeFilterCount = customerFilter.length + contactPersonFilter.length;

  const handleSearch = () => {
    setSearchInput(searchInput);
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Angebote</h1>
      </div>

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
            placeholder="AG-Nr. Suchen..."
          />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setEditing(null)} size="sm">
            Erstellen <Plus className="size-4" />
          </Button>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex gap-2 w-fit flex-wrap">
          {customerFilter.map((id) => {
            const option = customerFilterOptions.find(i => i.value === id);
            if (!option) return null;
            return (
              <FilterChip
                key={`customer-${id}`}
                label="Kunde"
                value={option.label}
                onRemove={() => setCustomerFilter(customerFilter.filter(i => i !== id))}
              />
            );
          })}

          {contactPersonFilter.map((id) => {
            const option = contactPersonFilterOptions.find(i => i.value === id);
            if (!option) return null;
            return (
              <FilterChip
                key={`contact-${id}`}
                label="Kontakt"
                value={option.label}
                onRemove={() => setContactPersonFilter(contactPersonFilter.filter(i => i !== id))}
              />
            );
          })}
        </div>
      )}

      <div className="grid gap-2">
        {offers.map((offer) => (
          <OfferListItem key={offer.id} offer={offer} onEdit={setEditing} />
        ))}
      </div>

      {editing !== undefined && (
        <OfferModal
          key={editing?.id ?? 'create'}
          open={true}
          cancelFn={() => setEditing(undefined)}
          currentOffer={editing ?? undefined}
        />
      )}
    </div>
  );
}
