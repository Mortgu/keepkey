import { useOfferHook, useOrderHook } from "@/hooks";
import { formatDate } from "@/lib/format";

import type { Offer } from "@/types";
import { Button, Input, ModalDialog } from "@/components";
import { Search } from "lucide-react";

interface OrderModalProps {
  onClose: () => void;
}

export default function OrderModal({ onClose }: OrderModalProps) {
  const { offers } = useOfferHook();
  const { createOrder } = useOrderHook();

  const handleCreateOrder = (offer: Offer) => {
    createOrder({ offerId: offer.id });
    onClose();
  }

  return (
    <ModalDialog onClose={onClose}>
      <ModalDialog.Header>
        <h1 className="text-lg">Neue Bestellung erstellen</h1>
      </ModalDialog.Header>
      <ModalDialog.Content>
        <div className="grid gap-2">
          <Input placeholder="Suchen..." rightButton={{
            icon: <Search className="size-4" />,
            variant: "ghost",
            onClick: () => { },
          }} />

          {offers.map((offer: Offer) => (
            <div key={offer.id} className="border border-(--border) rounded-md p-2 hover:border-(--primary) hover:cursor-pointer hover:bg-(--primary-100)"
              onClick={() => handleCreateOrder(offer)}>
              <div className="grid">
                <div className="flex items-center gap-2">
                  <p className="text-(--text) font-normal">
                    {offer.customer.companyName}
                  </p>
                  -
                  <p className="text-(--text) font-normal">
                    {offer.quoteId}
                  </p>
                </div>

                <p className="text-(--neutral-400) text-sm font-light">
                  {formatDate(offer.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ModalDialog.Content>
      <ModalDialog.Footer>
        <Button onClick={onClose} type="button" size="sm" variant="secondary">
          Abbrechen
        </Button>
      </ModalDialog.Footer>
    </ModalDialog>
  );
}
