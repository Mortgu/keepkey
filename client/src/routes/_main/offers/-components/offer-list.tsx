import Button from "@/components/button/button";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import OfferModal from "./offer-modal";
import { useOffer } from "@/hooks/offer";
import { SortDropdown } from "@/components/filters";
import OfferListItem from "./offer-list-item";

import type {
  Offer
} from '@/types';

const sort_options = [
  { value: "date-desc", label: "Date – newest first" },
  { value: "date-asc", label: "Date – oldest first" },
  { value: "name-asc", label: "Name – A to Z" },
  { value: "name-desc", label: "Name – Z to A" },
];

export default function OfferList() {
  const [isOpen, setOpen] = useState<boolean>(false);
  const [sort, setSort] = useState<string>(sort_options[0].value);
  const { offers, deleteOffer } = useOffer();

  const sortedOffers = useMemo(() => {
    return [...(offers ?? [])].sort((a, b) => {
      switch (sort) {
        case "date-desc":
          return new Date(b?.createdAt || '').getTime() - new Date(a?.createdAt || '').getTime();
        case "date-asc":
          return new Date(a?.createdAt || '').getTime() - new Date(b?.createdAt || '').getTime();
        case "name-asc":
          return a.voucherId.localeCompare(b.voucherId);
        case "name-desc":
          return b.voucherId.localeCompare(a.voucherId);
        default:
          return 0;
      }
    });
  }, [offers, sort]);

  const handleDeleteOffer = (id: string) => {
    if (confirm("Angebot löschen?")) {
      deleteOffer({ id });
    } else {
    }
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Angebote</h1>
      </div>

      <div className="flex justify-between items-center">
        <div className="w-full flex items-center gap-4">
          <SortDropdown
            value={sort}
            onChange={setSort}
            options={sort_options}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setOpen(true)} size="sm">
            Erstellen <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-2">
        {sortedOffers.map((offer: Offer) => (
          <OfferListItem key={offer.id} offer={offer} />
        ))}
      </div>

      <OfferModal open={isOpen} cancelFn={() => setOpen(false)} />
    </div>
  );
}
