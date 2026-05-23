import React from "react";
import { AlertTriangle, Loader, Pen, Trash } from "lucide-react";

import { formatDate } from "@/lib/format";
import { formatEur } from "@/utils/utils";
import { DocumentItem } from "./card-components";
import OfferRevisionHistory from "./card-components/offer-revision-history";


import { useOfferHook } from "@/hooks";
import { Button, Badge, Collapsable } from "@/components";
import type { Document, Offer, OfferFlatRate, OfferPosition } from "@/types";

type Task = Offer["tasks"][number];

type OfferListItemProps = {
  offer: Offer;
  onEdit: (offer: Offer) => void;
};

export default function OfferCard({ offer, onEdit }: OfferListItemProps) {
  const { customerContactPerson: ccp, offerPositions, offerFlatRates, tasks } = offer;
  const { deleteOffer } = useOfferHook();

  const reservationTask = tasks.find((t: Task) => t.type === "RESERVATION");

  const handleDeleteOffer = () => {
    if (confirm("Angebot löschen")) {
      deleteOffer({ id: offer.id });
    }
  };

  return (
    <React.Fragment>
      <div className="border border-(--border) rounded-md">
        <div className="flex items-center justify-between px-4 py-3 border-b border-(--border) relative">
          <div className="grid gap-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-md">
                <a className="text-(--text) hover:cursor-pointer hover:underline">{offer.customer.companyName}</a>
                -
                <a>{offer.quoteId}</a>
                <span className="text-xs text-(--text-secondary) font-light">v{offer.version}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">

              {/* Contact person */}
              <div className="flex items-center gap-1 text-sm font-light">
                <label className="text-(--text-secondary)">Kontakt:</label>
                <p className="text-(--text) hover:cursor-pointer hover:underline">
                  {ccp.salutation} {ccp.firstName} {ccp.lastName}
                </p>
              </div>

              {/* Offer-Id. */}
              <div className="flex items-center gap-1 text-sm font-light">
                <label className="text-(--text-secondary)">Angebots-Nr.</label>
                <p className="text-(--text)">{offer.quoteId}</p>
                {reservationTask && (reservationTask.status === "PENDING" || reservationTask.status === "RUNNING") && (
                  <span className="flex items-center gap-1 text-(--text-secondary) text-xs ml-1" title="Reservierung in NextCloud läuft…">
                    <Loader className="size-3 animate-spin" />
                    Reservierung…
                  </span>
                )}
                {reservationTask?.status === "FAILED" && (
                  <span className="flex items-center gap-1 text-(--destructive) text-xs ml-1"
                    title={reservationTask.error ?? "Unbekannter Fehler"}>
                    <AlertTriangle className="size-3" />
                    Reservierung fehlgeschlagen
                  </span>
                )}
              </div>

              {/* Created at */}
              <div className="flex items-center gap-1 text-sm font-light">
                <label className="text-(--text-secondary)">Erstellt:</label>
                <p className="text-(--text)">
                  {formatDate(offer.createdAt ?? "")}
                </p>
              </div>

              {/* Valid until */}
              <div className="flex items-center gap-1 text-sm font-light">
                <label className="text-(--text-secondary)">Gültig bis:</label>
                <p className="text-(--text)">
                  {offer.validUntil ? formatDate(offer.validUntil) : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Total display */}
          <div className="flex flex-col items-end">
            <p className="text-md font-semibold">
              {formatEur(offer.net_amount)}
            </p>
            <p className="text-(--text-secondary) font-light text-sm">
              Gesamtpreis
            </p>
          </div>

        </div>

        {/* Products */}
        <Collapsable label="Produkte" className="w-full bg-(--subtle-50) justify-between rounded-none">
          <div className="grid gap-2 px-4 py-3">

            {/* Product */}
            {offerPositions.map((op: OfferPosition, i: number) => (
              <div key={i} className="flex items-center justify-between gap-2 border border-(--border) py-2 px-3 rounded-md">
                <div className="grid">
                  <div className="flex gap-2">
                    <p className="text-sm">{op.product.name}</p>
                    <Badge variant="draft">{op.contract.name}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 text-sm font-light">
                      <span className="text-(--text-secondary)">Seats:</span>
                      <p>{op.quantity}</p>
                    </div>
                    <div className="flex gap-1 text-sm font-light">
                      <span className="text-(--text-secondary)">Laufzeit:</span>
                      <p>{op.duration_months} Monate</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-sm font-semibold">
                    {formatEur(op.total_cents)}
                  </p>
                  <p className="text-(--text-secondary) font-light text-sm">
                    Gesamtpreis (netto)
                  </p>
                </div>
              </div>
            ))}

            {offerFlatRates.map((fr: OfferFlatRate, i: number) => (
              <div key={i} className="flex items-center justify-between gap-2 border border-(--border) py-2 px-3 rounded-md">
                <div className="grid">
                  <div className="flex gap-2">
                    <p className="text-sm">{fr.flatRate.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 text-sm font-light">
                      <span className="text-(--text-secondary)">Anzahl:</span>
                      <p>{fr.quantity}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-sm font-semibold">
                    {formatEur(fr.total_cents)}
                  </p>
                  <p className="text-(--text-secondary) font-light text-sm">
                    Gesamtpreis (netto)
                  </p>
                </div>
              </div>
            ))}

            {/* Total price */}
            <div className="flex items-center gap-2 border border-(--border) py-2 px-3 justify-end rounded-md">
              <span className="text-sm text-(--text-secondary) font-light">
                Gesamtpreis
              </span>{" "}
              <p>{formatEur(offer.net_amount)}</p>
            </div>
          </div>
        </Collapsable>

        {/* Documents */}
        <Collapsable label="Dokumente" className="w-full bg-(--subtle-50) justify-between rounded-none">
          <div className="grid gap-2 px-4 py-3">
            {offer.documents.map((document: Document) => (
              <DocumentItem key={document.id} document={document} />
            ))}
          </div>
        </Collapsable>

        {/* Revision history */}
        <Collapsable label="Versionshistorie" className="w-full bg-(--subtle-50) justify-between rounded-none">
          <OfferRevisionHistory offerId={offer.id} />
        </Collapsable>

        <div className="flex items-center justify-end px-2 border-t border-(--border)">

          <Button size="xs" variant="link" onClick={() => onEdit(offer)}
            icon={<Pen className="size-3" />} iconOnly />

          <Button size="xs" variant="link" onClick={handleDeleteOffer}
            icon={<Trash className="size-3" />} iconOnly />

        </div>
      </div>
    </React.Fragment>
  );
}
