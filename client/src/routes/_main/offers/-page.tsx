import { useTranslation } from "react-i18next";

import { Plus } from "lucide-react";
import OfferList from "./-components/offer-list";
import OfferModal from "./-components/modals/offer/offer-modal";
import useOfferFilters from "./-hooks/use-offer-filters";
import OfferFilters from "./-components/offer-filters";
import type { Offer } from "@keepit/schemas";
import { useContacts, useCustomers, useModal, useProducts } from "@/hooks";
import { Button, PageWidth } from "@/components";

export function OfferPage() {
  const { t } = useTranslation();
  const modal = useModal<Offer>();

  const filters = useOfferFilters();

  const { contacts } = useContacts();
  const { customers } = useCustomers();
  const { products } = useProducts();

  return (
    <PageWidth variant="none">
      <div className="bg-white border-b border-(--border) px-8 py-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex-1 grid gap-1">
            <h1 className="font-medium text-xl">{t("section.offers")}</h1>
            <h1 className="font-light text-sm text-gray-400">Zentrale verwaltung der Angebote</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Export Button */}
            {/* <Button icon={<Download size={14} />} variant="border" size="sm">Export</Button>*/}
            {/* Create Customer Button */}
            <Button icon={<Plus size={14} strokeWidth={3} />} variant="primary" size="sm"
              onClick={() => modal.open()}>Angebot erstellen</Button>
          </div>
        </div>

      </div>

      {modal.isOpen && (
        <OfferModal
          key={modal.key}
          closeFn={modal.close}
          currentOffer={modal.data ?? undefined}
        />
      )}

      <div className="">
        <div className="px-8 py-4 border-b border-(--border)">
          <OfferFilters
            filters={filters}
            customers={customers}
            contacts={contacts}
            products={products}
          />
        </div>

        <div className="px-8 py-6">
          <OfferList filters={filters} />
        </div>
      </div>
    </PageWidth>
  );
}
