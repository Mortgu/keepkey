import { Loader } from "lucide-react";

import ProductModalSection from "./modal-components/product-section";
import FlatRateModalSection from "./modal-components/flat-rate-section";
import { useOfferFormState } from "./modal-components/use-offer-form-state";

import type {
  ContactPerson,
  Customer,
  Offer,
  Supplier,
  User,
} from "@/types";
import { getFormError } from "@/lib/utils";
import {
  Button,
  DEFAULT_LANGUAGE_OPTIONS,
  Input,
  ModalDialog,
  SegmentedLanguageToggle,
  Select,
} from "@/components";
import {
  useCustomers,
  useLocale,
  useSupplierHook,
  useUserHook,
} from "@/hooks";

interface OfferModalProps {
  onClose: () => void;
  currentOffer?: Offer;
}

export default function OfferModal({ onClose, currentOffer }: OfferModalProps) {
  const { customers } = useCustomers();
  const { suppliers } = useSupplierHook();
  const { users } = useUserHook();
  const locale = useLocale();

  const state = useOfferFormState({
    currentOffer,
    onClose,
    customers,
    suppliers,
    locale,
  });

  const { form, isEdit, error } = state;

  const handleFormSubmit = (e: {
    preventDefault: () => void;
    stopPropagation: () => void;
  }) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

  return (
    <ModalDialog onClose={onClose}>
      <ModalDialog.Header>
        <div className="flex items-center justify-between w-full mr-2">
          <h1 className="text-lg">
            {isEdit ? "Angebot bearbeiten" : "Angebot erstellen"}
          </h1>

          <form.Field
            name="language"
            children={(field) => (
              <SegmentedLanguageToggle
                options={DEFAULT_LANGUAGE_OPTIONS}
                value={field.state.value}
                onChange={(lng) => field.handleChange(lng)}
              />
            )}
          />
        </div>
      </ModalDialog.Header>
      <ModalDialog.Content>
        <form
          id="offer-form"
          onSubmit={handleFormSubmit}
          className="grid gap-4"
        >
          <div className="flex flex-wrap justify-between items-center gap-4">
            <form.Field
              name="customerId"
              children={(field) => (
                <div className="flex-1">
                  <Select
                    label="Kunde"
                    error={getFormError(field.state.meta.errors)}
                    value={field.state.value}
                    onChange={(e) => {
                      const newCustomerId = e.target.value;
                      field.handleChange(newCustomerId);
                      const newCustomer = customers.find(
                        (c: Customer) => c.id === newCustomerId,
                      );
                      form.setFieldValue("contactPersonId",
                        newCustomer?.contactPersons[0]?.id ?? "",
                      );

                      // Sprache nur bei Create übernehmen
                      if (!isEdit && newCustomer?.language) {
                        form.setFieldValue("language", newCustomer.language)
                      }
                    }}
                  >
                    {customers.map((customer: Customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.companyName}
                      </option>
                    ))}
                    {customers.length <= 0 && <option value="">None</option>}
                  </Select>
                </div>
              )}
            />

            <form.Field
              name="contactPersonId"
              children={(field) => (
                <div className="flex-1">
                  <form.Subscribe
                    selector={(s) => s.values.customerId}
                    children={(customerId) => {
                      const selectedCustomer = customers.find(
                        (c: Customer) => c.id === customerId,
                      );
                      const contactPersons =
                        selectedCustomer?.contactPersons ?? [];

                      return (
                        <Select
                          label="Ansprechpartner Kunde"
                          value={field.state.value}
                          error={getFormError(field.state.meta.errors)}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={!customerId}
                        >
                          {contactPersons.map((cp: ContactPerson) => (
                            <option key={cp.id} value={cp.id}>
                              {cp.firstName} {cp.lastName}
                            </option>
                          ))}
                          {contactPersons.length <= 0 && (
                            <option value="">None</option>
                          )}
                        </Select>
                      );
                    }}
                  />
                </div>
              )}
            />

            <form.Field
              name="userId"
              children={(field) => (
                <div className="flex-1">
                  <Select
                    label="Unser Ansprechpartner"
                    value={field.state.value}
                    error={getFormError(field.state.meta.errors)}
                    onChange={(e) => field.handleChange(e.target.value)}
                  >
                    {users.map((user: User) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                    {users.length <= 0 && <option value="">None</option>}
                  </Select>
                </div>
              )}
            />
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4">
            <form.Field
              name="quoteId"
              children={(field) => (
                <div className="flex-1 grid gap-2 items-center">
                  <Input
                    label="AG-Nr."
                    value={field.state.value}
                    warning={
                      state.quoteIdWarning ??
                      getFormError(field.state.meta.errors)
                    }
                    warningTooltip={state.checkingQuoteId ? "Prüfe..." : undefined}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      state.clearQuoteIdWarning();
                    }}
                    onBlur={() => state.checkQuoteId(field.state.value)}
                  />
                </div>
              )}
            />

            <form.Field
              name="supplierId"
              children={(field) => (
                <div className="flex-1 grid gap-2 items-center">
                  <Select
                    label="Lieferant"
                    value={(field.state.value as string | null) ?? ""}
                    error={getFormError(field.state.meta.errors)}
                    onChange={(e) => field.handleChange(e.target.value || null)}
                  >
                    <option value="">None</option>
                    {suppliers.map((supplier: Supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
            />

            <form.Field
              name="paymentTerm"
              children={(field) => (
                <div className="flex-1 grid gap-2">
                  <Input
                    label="Zahlungsbedingung"
                    size="sm"
                    placeholder="Zahlungsbedingung..."
                    error={getFormError(field.state.meta.errors)}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4">
            <form.Field
              name="validUntil"
              children={(field) => (
                <div className="flex-1 grid gap-2">
                  <Input
                    label="Angebot gültig bis"
                    type="date"
                    size="sm"
                    placeholder="Gültig bis..."
                    error={getFormError(field.state.meta.errors)}
                    value={field.state.value?.split("T")[0] ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        field.handleChange(null);
                        return;
                      }
                      field.handleChange(`${val}T00:00:00.000Z`);
                    }}
                  />
                </div>
              )}
            />

            <form.Field
              name="requestFrom"
              children={(field) => (
                <div className="flex-1 grid gap-2">
                  <Input
                    label="Ihre Anfrage vom"
                    type="date"
                    size="sm"
                    placeholder="Ihre Anfrage vom..."
                    error={getFormError(field.state.meta.errors)}
                    value={field.state.value?.split("T")[0] ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        field.handleChange(null);
                        return;
                      }
                      field.handleChange(`${val}T00:00:00.000Z`);
                    }}
                  />
                </div>
              )}
            />
          </div>

          <ProductModalSection
            offerProducts={state.offerProducts}
            customerId={state.customerId}
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
        </form>
      </ModalDialog.Content>
      <ModalDialog.Footer>
        <div className="w-full flex items-center justify-between">
          <p className="text-(--destructive)">
            {error && `${error.message}`}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={onClose}
              type="button"
              size="sm"
              variant="secondary"
            >
              Abbrechen
            </Button>
            <form.Subscribe
              selector={(s) => [s.canSubmit, s.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  form="offer-form"
                  disabled={!canSubmit}
                  type="submit"
                  size="sm"
                >
                  {isSubmitting && <Loader className="size-4 animate-spin" />}
                  Speichern
                </Button>
              )}
            />
          </div>
        </div>
      </ModalDialog.Footer>
    </ModalDialog>
  );
}
