import { Loader } from "lucide-react";

import FlatRateModalSection from "./modal-components/flat-rate-section";
import ProductModalSection from "./modal-components/product-section";

import {
  Button, ModalDialog
} from "@/components";
import type {
  Contract,
  Customer,
  Offer,
  Product,
  Supplier,
  User
} from "@/types";
import type { SyntheticEvent } from "react";
import { useTranslation } from "react-i18next";
import useOfferFormState from "../-hooks/use-offer-form-state";
import WorkloadOfferModalSection from "./modal/workloads";
import FormOfferModal from "./modal/offer-form";

interface OfferModalProps {
  closeFn: () => void;

  currentOffer: Offer | undefined;

  customers: Array<Customer>;
  suppliers: Array<Supplier>;
  users: Array<User>;
  products: Array<Product>;
  contracts: Array<Contract>;
}

export default function OfferModal(props: OfferModalProps) {
  const { closeFn, currentOffer, customers, suppliers, users } = props;

  const { t } = useTranslation();
  const state = useOfferFormState({
    closeFn,
    currentOffer,
    customers,
    suppliers,
    users
  });

  const { form, isEdit, error } = state;

  const handleFormSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

  return (
    <ModalDialog onClose={closeFn}>
      <ModalDialog.Header>
        <div className="flex items-center justify-between w-full mr-2">
          <h1 className="text-lg">
            {isEdit ? "Angebot bearbeiten" : "Angebot erstellen"}
          </h1>
        </div>
      </ModalDialog.Header>
      <ModalDialog.Content>
        <div className="grid gap-4">

          <FormOfferModal currentOffer={currentOffer} />

          <WorkloadOfferModalSection
            customerId={state.customerId}
            currentOffer={currentOffer}
          />

          <ProductModalSection
            offerProducts={state.offerProducts}
            customerId={state.customerId}
            featureComparison={state.featureComparison}
            onToggleFeatureComparison={state.toggleFeatureComparison}
            onAdd={state.addProduct}
            onUpdate={state.updateProduct}
            onRemove={state.removeProduct}
            onPersistOverride={state.persistCustomerOverride}
          />

          <FlatRateModalSection
            offerFlatRates={state.offerFlatRates}
            onAdd={state.addFlatRate}
            onRemove={state.removeFlatRate}
          />
        </div>
      </ModalDialog.Content>
      <ModalDialog.Footer>
        <div className="w-full flex items-center justify-between">
          <p className="text-(--destructive)">
            {error && `${error.message}`}
          </p>
          <div className="flex gap-2">
            <Button variant="border" size="sm" type="button" onClick={closeFn}>
              {t("button.cancel")}
            </Button>
            <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]} children={([canSubmit, isSubmitting]) => (
              <Button form="offer-modal-form" disabled={!canSubmit} type="submit" size="sm">
                {isSubmitting && <Loader className="size-4 animate-spin" />}
                {t("button.save")}
              </Button>
            )} />
          </div>
        </div>
      </ModalDialog.Footer>
    </ModalDialog>
  );
}
