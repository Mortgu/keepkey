import { Loader } from "lucide-react";


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
import { useTranslation } from "react-i18next";
import useOfferForm from "../-hooks/use-offer-form";
import useOfferFormState from "../-hooks/use-offer-form-state";
import FlatrateOfferModalSection from "./modal/flatrates";
import FormOfferModal from "./modal/offer-form";
import WorkloadOfferModalSection from "./modal/workloads";

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

  const { form, customerId } = useOfferForm({ currentOffer });
  const { isEdit, error } = state;

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

          <FormOfferModal form={form} />

          <WorkloadOfferModalSection
            customerId={customerId}
            currentOffer={currentOffer}
            form={form}
          />

          <FlatrateOfferModalSection
            form={form}
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
