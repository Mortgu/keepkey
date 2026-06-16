import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Pen, Trash, UndoDot } from "lucide-react";
import { Document, LineItemRow } from "./card-components";
import OfferRevisionHistory from "./card-components/offer-revision-history";
import type { Offer, OfferDocument } from "@/types";
import { formatDate } from "@/lib/format";
import { formatEur } from "@/utils/utils";
import { useLocale, useOfferHook } from "@/hooks";
import { Badge, Button, Collapsable, Drawer } from "@/components";
import { localized } from "@/lib/i18n-content";

type OfferListItemProps = {
  offer: Offer;
  onEdit: (offer: Offer) => void;
};

function OfferPositionRow({ op }: { op: Offer["offerPositions"][number] }) {
  const locale = useLocale();
  return (
    <LineItemRow
      left={
        <div className="grid">
          <div className="flex gap-2">
            <p className="text-sm">
              {localized(op.product.translations, locale, "name")}
            </p>
            <Badge variant="draft">
              {localized(op.contract.translations, locale, "name")}
            </Badge>
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
      }
      right={
        <>
          <p className="text-sm font-semibold">{formatEur(op.total_cents)}</p>
          <p className="text-(--text-secondary) font-light text-sm">
            Gesamtpreis (netto)
          </p>
        </>
      }
    />
  );
}

function OfferFlatRateRow({ fr }: { fr: Offer["offerFlatRates"][number] }) {
  const locale = useLocale();
  return (
    <LineItemRow
      left={
        <div className="grid">
          <p className="text-sm">
            {localized(fr.flatRate.translations, locale, "name")}
          </p>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 text-sm font-light">
              <span className="text-(--text-secondary)">Anzahl:</span>
              <p>{fr.quantity}</p>
            </div>
          </div>
        </div>
      }
      right={
        <>
          <p className="text-sm font-semibold">{formatEur(fr.total_cents)}</p>
          <p className="text-(--text-secondary) font-light text-sm">
            Gesamtpreis (netto)
          </p>
        </>
      }
    />
  );
}

export default function OfferCard({ offer, onEdit }: OfferListItemProps) {
  const {
    customerContactPerson: ccp,
    quoteId,
    offerPositions,
    offerFlatRates,
    customer,
  } = offer;
  const {
    deleteOffer,
    errorDeletingOffer,

    generateDocument,
    isGeneratingDocument,
  } = useOfferHook();

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const handleDeleteOffer = () => {
    if (confirm("Angebot löschen")) {
      deleteOffer({ id: offer.id });
    }
  };

  useEffect(() => {
    if (errorDeletingOffer) {
      toast.error(`${errorDeletingOffer}`);
    }
  }, [errorDeletingOffer]);

  return (
    <div className="border border-(--border) rounded-md">
      <div className="flex items-center justify-between px-4 py-3 border-b border-(--border) relative">
        <div className="grid gap-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-md">
              <span className="text-(--text)">{customer.companyName}</span>
              <span>-</span>
              <span>{quoteId}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1 text-sm font-light">
              <label className="text-(--text-secondary)">Kontakt:</label>
              <p className="text-(--text)">
                {ccp.salutation} {ccp.firstName} {ccp.lastName}
              </p>
            </div>

            <div className="flex items-center gap-1 text-sm font-light">
              <label className="text-(--text-secondary)">Angebots-Nr.</label>
              <p className="text-(--text)">{quoteId}</p>
            </div>

            <div className="flex items-center gap-1 text-sm font-light">
              <label className="text-(--text-secondary)">Erstellt:</label>
              <p className="text-(--text)">{formatDate(offer.createdAt)}</p>
            </div>

            <div className="flex items-center gap-1 text-sm font-light">
              <label className="text-(--text-secondary)">Gültig bis:</label>
              <p className="text-(--text)">
                {offer.validUntil ? formatDate(offer.validUntil) : "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <p className="text-md font-semibold">{formatEur(offer.net_amount)}</p>
          <p className="text-(--text-secondary) font-light text-sm">
            Gesamtpreis
          </p>
        </div>
      </div>

      <Collapsable
        label="Produkte"
        className="w-full bg-(--subtle-50) justify-between rounded-none"
      >
        <div className="grid gap-2 px-4 py-3">
          {offerPositions.map((op, i) => (
            <OfferPositionRow key={i} op={op} />
          ))}
          {offerFlatRates.map((fr, i) => (
            <OfferFlatRateRow key={i} fr={fr} />
          ))}
          <LineItemRow
            left={
              <span className="text-sm text-(--text-secondary) font-light">
                Gesamtpreis
              </span>
            }
            right={<p>{formatEur(offer.net_amount)}</p>}
          />
        </div>
      </Collapsable>

      <Collapsable
        label="Dokumente"
        className="w-full bg-(--subtle-50) justify-between rounded-none"
      >
        <div className="grid gap-2 px-4 py-3">
          {offer.offerDocuments.map((document: OfferDocument) => (
            <Document
              key={document.id}
              offer={offer}
              document={document.document}
            />
          ))}

          <Button
            className="min-w-fit"
            variant="primary"
            size="sm"
            loading={isGeneratingDocument}
            disabled={isGeneratingDocument}
            onClick={() => generateDocument({ offerId: offer.id })}
          >
            Dokument generieren
          </Button>
        </div>
      </Collapsable>

      <Collapsable
        label="Versionshistorie"
        className="w-full bg-(--subtle-50) justify-between rounded-none"
      >
        <OfferRevisionHistory offerId={offer.id} />
      </Collapsable>

      <div className="flex items-center justify-between px-2 py-2 border-t border-(--border)">
        <div className="flex items-center gap-2"></div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setDrawerOpen(true)}
            size="xs"
            variant="secondary"
            icon={<UndoDot className="size-3" />}
            iconOnly
          />

          <Button
            size="xs"
            variant="secondary"
            onClick={() => onEdit(offer)}
            icon={<Pen className="size-3" />}
            iconOnly
          />

          <Button
            size="xs"
            variant="secondary"
            onClick={handleDeleteOffer}
            icon={<Trash className="size-3" />}
            iconOnly
          />
        </div>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Drawer.Header title="History" subtitle="Vergangene Preistabellen" />
        <Drawer.Body>
          {/* Test Version Snapshot component mock */}
          <div className="flex flex-col ">
            <div className="flex relative gap-3.25 py-3.5 border-b border-(--border)">
              {/* vertical-rail */}
              <div className="flex flex-col items-center shrink-0 pt-0.75">
                {/* vertical-dot */}
                <div className="w-2.75 h-2.75 rounded-full border border-(--primary-800) bg-(--primary-800) shadow-[0_0_0_4px_var(--success-subtle)]"></div>

                {/* vertical-line */}
                <div className="w-[2px] flex-1 bg-(--success-subtle) m-t-[4px]"></div>
              </div>

              {/* main */}
              <div className="flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[13px] font-semibold">v4</span>
                  <span className="text-[10px] font-bold text-(--primary-600) bg-(--success-subtle) py-0.5 px-2 rounded-full">
                    CURRENT
                  </span>
                </div>

                {/* when */}
                <div className="text-[11px] text-(--fg-3) mt-0.5">
                  14 Jun 2026, 09:42 · j.morel
                </div>

                {/* changes */}
                <div className="mt-2 flex flex-col gap-1 ">
                  <div className="flex gap-1 text-[12px] text-(--fg-3) text-1/4 before:content-[' '] before:w-1 before:h-1 before:rounded-full before:bg-(--fg-3) before:shrink-0 before:mt-1.5">
                    Volume discount raised from 8 % to 12 % (1.001–5.000 band)
                  </div>
                  <div className="flex gap-1 text-[12px] text-(--fg-3) text-1/4 before:content-[' '] before:w-1 before:h-1 before:rounded-full before:bg-(--fg-3) before:shrink-0 before:mt-1.5">
                    Term extended to 36 months
                  </div>
                </div>

                {/* actions */}
                <div className="mt-2.5 flex gap-1.5 flex-wrap">
                  <Button size="xs" variant="secondary">
                    Restore this version
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex relative gap-3.25 py-3.5 border-b border-(--border)">
              {/* vertical-rail */}
              <div className="flex flex-col items-center shrink-0 pt-0.75">
                {/* vertical-dot */}
                <div className="w-2.75 h-2.75 rounded-full border-2 border-(--border)"></div>

                {/* vertical-line */}
                <div className="w-[2px] flex-1 bg-(--border) m-t-[4px]"></div>
              </div>

              {/* main */}
              <div className="flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[13px] font-semibold">v4</span>
                  <span className="text-[10px] font-bold text-(--primary-600) bg-(--success-subtle) py-0.5 px-2 rounded-full">
                    CURRENT
                  </span>
                </div>

                {/* when */}
                <div className="text-[11px] text-(--fg-3) mt-0.5">
                  14 Jun 2026, 09:42 · j.morel
                </div>

                {/* changes */}
                <div className="mt-2 flex flex-col gap-1 ">
                  <div className="flex gap-1 text-[12px] text-(--fg-3) text-1/4 before:content-[' '] before:w-1 before:h-1 before:rounded-full before:bg-(--fg-3) before:shrink-0 before:mt-1.5">
                    Volume discount raised from 8 % to 12 % (1.001–5.000 band)
                  </div>
                  <div className="flex gap-1 text-[12px] text-(--fg-3) text-1/4 before:content-[' '] before:w-1 before:h-1 before:rounded-full before:bg-(--fg-3) before:shrink-0 before:mt-1.5">
                    Term extended to 36 months
                  </div>
                </div>

                {/* actions */}
                <div className="mt-2.5 flex gap-1.5 flex-wrap">
                  <Button size="xs" variant="secondary">
                    Restore this version
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Drawer.Body>
      </Drawer>
    </div>
  );
}
