import Button from "@/components/button/button";
import type {
  DocumentJob,
  Offer,
  OfferFlatRate,
  OfferPosition,
} from "@/data/types";
import { useOffer } from "@/hooks/offer";
import { formatEur } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  CloudUpload,
  FileText,
  Link2,
  Pen,
  Trash,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { BASE_URL } from "@/lib/api-client.ts";
import OfferModal from "./offer-modal";
import Badge from "@/components/badge";
import Collapsable from "@/components/collapsable";
import { formatDate } from "@/lib/format";
import OfferFile from "./offer-file";

type NextcloudUploadStatus = null | "uploading" | "uploaded" | "error";

type OfferListItemProps = {
  offer: Offer;
};

export default function OfferListItem({ offer }: OfferListItemProps) {
  const { customerContactPerson: ccp, offerPositions, documentJobs } = offer;
  const { deleteOffer } = useOffer();

  const handleDeleteOffer = () => {
    if (confirm("Angebot löschen")) {
      deleteOffer({ id: offer.id });
    }
  };

  return (
    <div className="border border-(--border) rounded-md">
      <div className="flex items-center justify-between px-4 py-3 border-b border-(--border) relative">
        <div className="grid gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-md">
              {offerPositions.map((i) => i.product.name).join(" & ")}
            </h1>
            <Badge variant="generated" />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Company */}
            <div className="flex items-center gap-1 text-sm font-light">
              <label className="text-(--text-secondary)">Firma:</label>
              <p className="text-(--text) hover:cursor-pointer hover:underline">
                {offer.customer.companyName}
              </p>
            </div>

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
              <p className="text-(--text)">{offer.voucherId}</p>
            </div>

            {/* Created at */}
            <div className="flex items-center gap-1 text-sm font-light">
              <label className="text-(--text-secondary)">Erstellt:</label>
              <p className="text-(--text)">{formatDate(offer.createdAt)}</p>
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
            {formatEur(offer.total_amount)}
          </p>
          <p className="text-(--text-secondary) font-light text-sm">
            Gesamtpreis
          </p>
        </div>
      </div>

      {/* Products */}
      <Collapsable
        label="Produkte"
        className="w-full bg-(--subtle-50) justify-between rounded-none"
      >
        <div className="grid gap-2 px-4 py-3">
          {/* Product */}
          {offerPositions.map((op: OfferPosition, i: number) => (
            <div
              key={i}
              className="flex items-center justify-between gap-2 border border-(--border) py-2 px-3 rounded-md"
            >
              <div className="grid">
                <div className="flex gap-2">
                  <p className="text-sm">{op.product.name}</p>
                  <Badge variant="draft">{op.contract.name}</Badge>
                </div>
                <div className="flex gap-1 text-sm font-light">
                  <span className="text-(--text-secondary)">Laufzeit:</span>
                  <p>{op.duration_months} Monate</p>
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

          {/* Total price */}
          <div className="flex items-center gap-2 border border-(--border) py-2 px-3 justify-end rounded-md">
            <span className="text-sm text-(--text-secondary) font-light">
              Gesamtpreis
            </span>{" "}
            <p>{formatEur(offer.total_amount)}</p>
          </div>
        </div>
      </Collapsable>

      {/* Documents */}
      <Collapsable
        label="Dokumente"
        className="w-full bg-(--subtle-50) justify-between rounded-none"
      >
        <div className="grid gap-2 px-4 py-3">
          {documentJobs.map((documentJob: DocumentJob, index: number) => (
            <OfferFile key={index} document={documentJob} />
          ))}
        </div>
      </Collapsable>

      <div className="flex items-center justify-end px-2 border-t border-(--border)">
        <Button
          size="xs"
          variant="link"
          icon={<Pen className="size-3" />}
          iconOnly
        />
        <Button
          onClick={handleDeleteOffer}
          size="xs"
          variant="link"
          icon={<Trash className="size-3" />}
          iconOnly
        />
      </div>
    </div>
  );
}
