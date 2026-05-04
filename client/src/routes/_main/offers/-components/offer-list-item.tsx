import Button from "@/components/button/button";
import type { Offer, OfferFlatRate, OfferPosition } from "@/data/types";
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

type NextcloudUploadStatus = null | "uploading" | "uploaded" | "error";

type OfferListItemProps = {
  offer: Offer;
};

export default function OfferListItem({ offer }: OfferListItemProps) {
  const { deleteOffer } = useOffer();
  const [isEditing, setEditing] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<NextcloudUploadStatus>(null);
  const [nextcloudUrl, setNextcloudUrl] = useState<string | null>(null);

  const { data: job } = useQuery({
    queryKey: ["documentJob", offer.id],
    queryFn: async () => {
      const response = await fetch(
        `${BASE_URL}/api/offers/${offer.id}/jobs`,
        {
          credentials: "include",
        },
      );
      if (!response.ok) return null;
      return await response.json();
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "completed" || status === "failed") return false;
      return 3000;
    },
  });

  const handleDeleteOffer = (id: string) => {
    if (confirm("Angebot löschen?")) {
      deleteOffer({ id });
    }
  };

  const handleEditOffer = () => {
    setEditing(true);
  };

  return (
    <div className="grid border border-(--border) rounded-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-(--border) px-3 py-2">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-base font-medium">{offer.voucherId}</p>
            <p className="text-sm text-gray-500">
              {offer.customer.companyName} ·{" "}
              {offer.customerContactPerson.firstName}{" "}
              {offer.customerContactPerson.lastName}
            </p>
          </div>
          <div className="hidden sm:block text-sm text-gray-500">
            {/*<p>Gültig bis: {formatDate(offer.validUntil)}</p>
                                    <p>Anfrage vom: {formatDate(offer.requestFrom)}</p>*/}
          </div>
        </div>
        <div className="flex items-center">
          <Button
            onClick={handleEditOffer}
            size="sm"
            variant="ghost"
            icon={<Pen className="size-4" />}
            iconOnly
          />
          <OfferModal
            open={isEditing}
            cancelFn={() => setEditing(false)}
            currentOffer={offer}
          />
          <Button
            onClick={() => handleDeleteOffer(offer.id)}
            size="sm"
            variant="ghost"
            icon={<Trash className="size-4" />}
            iconOnly
          />
        </div>
      </div>

      {/* Position */}
      <div className="flex items-center">
        <div className="grid flex-1">
          {offer.offerPositions.map((pos: OfferPosition, i) => (
            <div
              key={i}
              className="flex items-center justify-between even:bg-gray-50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <p className="text-sm">
                  {pos.product.name} {pos.optional && "(optional)"}
                </p>
                <p className="text-sm text-gray-400">
                  ({pos.contract.name} / {String(pos.duration_months)} Monate)
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="w-20 text-right font-medium text-gray-700">
                  {formatEur(pos.total_cents)}
                </span>
              </div>
            </div>
          ))}

          {offer.offerFlatRates.map((ofr: OfferFlatRate, i) => (
            <div
              key={i}
              className="flex items-center justify-between even:bg-gray-50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <p className="text-sm">{ofr.flatRate.name}</p>
                <p className="text-sm text-gray-400"></p>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="w-20 text-right font-medium text-gray-700">
                  {formatEur(ofr.total_cents)}
                </span>
              </div>
            </div>
          ))}

          <hr className="border-(--border)" />

          <div className="flex items-center justify-between px-3 py-2 text-sm font-medium">
            <span className="">Zwischensumme (Netto)</span>
            <span>{formatEur(offer.net_amount)}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 text-sm font-medium">
            <span className="">+ Steuern</span>
            <span>+ {formatEur(offer.tax_amount)}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 text-sm font-medium">
            <span className="">Gesamt (Brutto)</span>
            <span>{formatEur(offer.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Dokumente */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-(--page-bg) border-t border-(--border)">
        <div className="flex items-center gap-2">
          <a href={BASE_URL + "/" + offer.documentJobs[0].pdfPath}>
            <Button
              loading={
                job?.status === "pending" || job?.status === "generating"
              }
              variant="secondary"
              size="sm"
              icon={<FileText className="size-3.5" />}
            >
              PDF
            </Button>
          </a>

          <a href={BASE_URL + "/" + offer.documentJobs[0].docxPath}>
            <Button
              loading={
                job?.status === "pending" || job?.status === "generating"
              }
              variant="secondary"
              size="sm"
              icon={<FileText className="size-3.5" />}
            >
              DOCX
            </Button>
          </a>
        </div>

        {/* Nextcloud Upload */}
        <div className="flex items-center gap-2">
          {uploadStatus === "uploaded" && nextcloudUrl && (
            <a
              href={nextcloudUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 transition-colors"
            >
              <CheckCircle2 className="size-3.5" />
              In Nextcloud
              <Link2 className="size-3" />
            </a>
          )}
          {uploadStatus === "error" && (
            <span className="flex items-center gap-1.5 text-sm text-red-500">
              <XCircle className="size-3.5" />
              Upload fehlgeschlagen
            </span>
          )}
          <Button
            variant="secondary"
            size="sm"
            loading={uploadStatus === "uploading"}
            icon={<CloudUpload className="size-3.5" />}
            onClick={() => setUploadStatus("uploading")}
          >
            Nextcloud
          </Button>
        </div>
      </div>
    </div>
  );
}
