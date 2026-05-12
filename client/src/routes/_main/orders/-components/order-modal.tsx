import { useOfferHook, useOrderHook } from "@/hooks";
import { formatDate } from "@/lib/format";

import type { Offer } from "@/types";
import { Button, Input, ModalDialog } from "@/components";
import { ArrowRightIcon, Search } from "lucide-react";

interface OrderModalProps {
  open: boolean;
  cancelFn: () => void;
  submitFn: () => void;
  currentOrder?: any | null;
}

export default function OrderModal({ open, cancelFn, submitFn, currentOrder }: OrderModalProps) {
  const { offers } = useOfferHook();
  const { createOrder, errorCreatingOrder } = useOrderHook();


  return (
    <ModalDialog open={open} cancelFn={cancelFn}>
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
            <div className="border border-(--border) rounded-md p-2 hover:border-(--primary) hover:cursor-pointer hover:bg-(--primary-100)"
              onClick={() => createOrder({ offerId: offer.id })}>
              <div className="grid">
                <p className="text-(--text) font-normal">{offer.quoteId}</p>
                <p className="text-(--neutral-400) text-sm font-light">
                  {formatDate(offer.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ModalDialog.Content>
      <ModalDialog.Footer>
        <Button onClick={cancelFn} type="button" size="sm" variant="secondary">
          Abbrechen
        </Button>
        <Button form="order-form" type="submit" size="sm">
          Speichern
        </Button>
      </ModalDialog.Footer>
    </ModalDialog>
  );
}
