import { Filter, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import OfferModal from "./offer-modal";
import { useCustomerHook, useOfferHook } from "@/hooks";
import OfferListItem from "./offer-list-item";

import type { Customer, Offer } from "@/types";
import { Button, FilterChip, Input, SearchBar, SortDropdown } from "@/components";
import { MultiDropdown } from "@/components/filters/multi-dropdown";

const sort_options = [
  { value: "date-desc", label: "Date – newest first" },
  { value: "date-asc", label: "Date – oldest first" },
  { value: "name-asc", label: "Name – A to Z" },
  { value: "name-desc", label: "Name – Z to A" },
];

export default function OfferList() {
  const [isOpen, setOpen] = useState<boolean>(false);

  const { offers } = useOfferHook();
  const { customers } = useCustomerHook();

  const [sort, setSort] = useState<string>(sort_options[0].value);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const customerFilterOptions = customers.map((customer: Customer) => {
    return { value: customer.id as string, label: customer.companyName as string };
  });
  const [customerFilter, setCustomerFilter] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);

  const sortedOffers = useMemo(() => {
    return [...(offers ?? [])].sort((a, b) => {
      switch (sort) {
        case "date-desc":
          return (
            new Date(b?.createdAt || "").getTime() -
            new Date(a?.createdAt || "").getTime()
          );
        case "date-asc":
          return (
            new Date(a?.createdAt || "").getTime() -
            new Date(b?.createdAt || "").getTime()
          );
        case "name-asc":
          return a.voucherId.localeCompare(b.voucherId);
        case "name-desc":
          return b.voucherId.localeCompare(a.voucherId);
        default:
          return 0;
      }
    });
  }, [offers, sort]);

  useEffect(() => {
    console.log(searchQuery)
  }, [searchQuery, setSearchQuery]);

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

          <MultiDropdown label="Kunde" options={customerFilterOptions} values={customerFilter} onChange={(e) => {
            setCustomerFilter(e)
          }} />

          <SearchBar value={searchQuery} onChange={(e) => setSearchQuery(e)} placeholder="AG-Nr. Suchen..." />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setOpen(true)} size="sm">
            Erstellen <Plus className="size-4" />
          </Button>
        </div>
      </div>

      {customerFilter.length >= 1 && (
        <div className="flex gap-2 w-fit">
          {customerFilter.map((e) => {
            const option = customerFilterOptions.find(i => i.value == e);
            if (!option) return null;
            return (
              <FilterChip key={e} label="Kunde" value={option?.label} onRemove={() => setCustomerFilter(customerFilter.filter(i => i !== e))} />
            )
          })}
        </div>
      )}

      {error && (
        <div className="">
          <p className="text-(--destructive)">{error}</p>
        </div>
      )}

      <div className="grid gap-2">
        {sortedOffers.map((offer: Offer) => (
          <OfferListItem key={offer.id} offer={offer} />
        ))}
      </div>

      <OfferModal open={isOpen} cancelFn={() => setOpen(false)} />
    </div>
  );
}
