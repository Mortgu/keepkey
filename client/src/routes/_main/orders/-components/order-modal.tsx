import Button from "@/components/button/button";
import ModalDialog from "@/components/modal";
import type { Offer } from "@/types";
import { useOffer } from "@/hooks/offer";
import { formatDate } from "@/lib/format";

interface OrderModalProps {
  open: boolean;
  cancelFn: () => void;
  submitFn: () => void;
  currentOrder?: any | null;
}

export default function OrderModal({
  open,
  cancelFn,
  submitFn,
  currentOrder,
}: OrderModalProps) {
  const { offers } = useOffer();

  return (
    <ModalDialog open={open} cancelFn={cancelFn}>
      <ModalDialog.Header>
        <h1 className="text-lg">Neue Bestellung erstellen</h1>
      </ModalDialog.Header>
      <ModalDialog.Content>
        {offers.map((offer: Offer) => (
          <div className="border border-(--border) rounded-md p-2 hover:border-(--primary) hover:cursor-pointer hover:bg-(--primary-100)">
            <div className="grid">
              <p className="text-(--text) font-normal">{offer.voucherId}</p>
              <p className="text-(--neutral-400) text-sm font-light">
                {formatDate(offer.date)}
              </p>
            </div>
          </div>
        ))}
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
