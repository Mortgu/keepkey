import { useOrderHook } from "@/hooks";
import { formatDate } from "@/lib/format";
import { getFormErrors } from "@/lib/utils";
import type { Offer } from "@/types";
import { useForm } from "@tanstack/react-form";
import { ArrowLeft, Search } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { Button, Input, ModalDialog, Textarea } from "@/components";
import { useOffers } from "@/hooks/offers/offer-hooks";

interface OrderModalProps {
  onClose: () => void;
}

const orderSchema = z.object({
  orderId: z.string().min(1, "Bestell-Nr. erforderlich"),
  date: z.string(),
  projectNumber: z.string(),
  projectDescription: z.string(),
  orderDetails: z.string(),
});

function toInputDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function OrderModal({ onClose }: OrderModalProps) {
  const { items: offers } = useOffers();
  const { createOrder, nextOrderNumber } = useOrderHook();
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  const form = useForm({
    defaultValues: {
      orderId: nextOrderNumber ?? "",
      date: toInputDate(new Date()),
      projectNumber: "",
      projectDescription: "",
      orderDetails: "",
    },
    validators: {
      onChange: orderSchema,
    },
    onSubmit: async ({ value }) => {
      if (!selectedOffer) return;
      await createOrder({
        offerId: selectedOffer.id,
        orderId: value.orderId,
        date: value.date,
        projectNumber: value.projectNumber || undefined,
        projectDescription: value.projectDescription || undefined,
        orderDetails: value.orderDetails || undefined,
      });
      onClose();
    },
  });

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

  return (
    <ModalDialog onClose={onClose}>
      <ModalDialog.Header>
        <div className="flex items-center gap-2">
          {selectedOffer && (
            <button
              type="button"
              onClick={() => setSelectedOffer(null)}
              className="text-(--text-secondary) hover:text-(--text)"
            >
              <ArrowLeft className="size-5" />
            </button>
          )}
          <h1 className="text-lg">Neue Bestellung erstellen</h1>
        </div>
      </ModalDialog.Header>
      <ModalDialog.Content>
        {!selectedOffer ? (
          <div className="grid gap-2">
            <Input placeholder="Suchen..." rightButton={{
              icon: <Search className="size-4" />,
              variant: "ghost",
              onClick: () => { },
            }} />

            {offers.map((offer: Offer) => (
              <div key={offer.id} className="border border-(--border) rounded-md p-2 hover:border-(--primary) hover:cursor-pointer hover:bg-(--primary-100)"
                onClick={() => setSelectedOffer(offer)}>
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
        ) : (
          <form id="order-form" onSubmit={handleSubmit} className="grid gap-4">
            <div className="flex items-center gap-2 text-sm text-(--text-secondary)">
              <span>Angebot:</span>
              <span className="font-medium text-(--text)">
                {selectedOffer.customer.companyName} — {selectedOffer.quoteId}
              </span>
            </div>

            <form.Field name="orderId" children={(field) => (
              <Input
                id={field.name}
                label="Bestell-Nr."
                value={field.state.value}
                error={getFormErrors(field.state.meta.errors)}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )} />

            <form.Field name="date" children={(field) => (
              <Input
                id={field.name}
                type="date"
                label="Bestelldatum"
                value={field.state.value}
                error={getFormErrors(field.state.meta.errors)}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )} />

            <form.Field name="projectNumber" children={(field) => (
              <Input
                id={field.name}
                label="Projekt-Nr."
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )} />

            <form.Field name="projectDescription" children={(field) => (
              <Textarea
                id={field.name}
                label="Projektbezug"
                placeholder="Kurzbeschreibung des Projekts"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )} />

            <form.Field name="orderDetails" children={(field) => (
              <Textarea
                id={field.name}
                label="Bestelldetails"
                placeholder="Registrierung, Absprachen, etc."
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )} />
          </form>
        )}
      </ModalDialog.Content>
      <ModalDialog.Footer>
        {selectedOffer ? (
          <>
            <Button onClick={() => setSelectedOffer(null)} type="button" size="sm" variant="secondary">
              Zurück
            </Button>
            <Button type="submit" size="sm" form="order-form">
              Bestellung erstellen
            </Button>
          </>
        ) : (
          <Button onClick={onClose} type="button" size="sm" variant="secondary">
            Abbrechen
          </Button>
        )}
      </ModalDialog.Footer>
    </ModalDialog>
  );
}
