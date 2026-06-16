import { useState } from "react";
import { useForm } from "@tanstack/react-form";

import { Loader, Plus, Trash, X } from "lucide-react";

import ProductModalSection from "./modal-components/product-section";
import OfferFlatRateForm from "./modal-components/offer-flat-rate-form";
import { offerSchema } from "./offer-utils";

import type { z } from "zod";
import type { OfferProductInput } from "./modal-components/offer-product-form";

import type {
  ContactPerson,
  CreateOfferFlatRatesInput,
  CreateOfferInput,
  CreateOfferPositionInput,
  Customer,
  Offer,
  Supplier,
  UpdateOfferFlatRatesInput,
  UpdateOfferInput,
  UpdateOfferPositionInput,
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
  useCustomerHook,
  useFlatRateHook,
  useLocale,
  useOfferHook,
  useSupplierHook,
  useUserHook,
} from "@/hooks";

import { formatEur } from "@/utils/utils";
import { localized } from "@/lib/i18n-content";

import { useAuth } from "@/context/auth";
import { findOfferFilesByIdAction } from "@/data/nextcloud";

interface OfferModalProps {
  onClose: () => void;
  currentOffer?: Offer;
}

const getFormDefaults = (
  currentOffer: Offer | undefined,
  defaults?: Partial<z.infer<typeof offerSchema>>,
): z.infer<typeof offerSchema> => {
  if (currentOffer !== undefined) {
    return {
      customerId: currentOffer.customerId,
      contactPersonId: currentOffer.contactPersonId,
      userId: currentOffer.userId,
      quoteId: currentOffer.quoteId,
      language: currentOffer.language,
      supplierId: currentOffer.supplierId ?? null,
      paymentTerm: currentOffer.paymentTerm,
      validUntil: currentOffer.validUntil ?? null,
      requestFrom: currentOffer.requestFrom ?? null,
    };
  }

  return {
    customerId: defaults?.customerId ?? "",
    contactPersonId: defaults?.contactPersonId ?? "",
    userId: defaults?.userId ?? "",
    quoteId: defaults?.quoteId ?? "",
    language: defaults?.language ?? "DE",
    supplierId: defaults?.supplierId ?? null,
    paymentTerm: defaults?.paymentTerm ?? "30 Tage",
    validUntil: defaults?.validUntil ?? null,
    requestFrom: defaults?.requestFrom ?? null,
  };
};

export default function OfferModal({ onClose, currentOffer }: OfferModalProps) {
  const isEdit = currentOffer !== undefined;

  const { user } = useAuth();

  const { customers } = useCustomerHook();
  const { suppliers } = useSupplierHook();
  const { users } = useUserHook();
  const { flatRates } = useFlatRateHook();

  const locale = useLocale();

  const [offerProducts, setOfferProducts] = useState<Array<OfferProductInput>>(
    currentOffer?.offerPositions.map((pos) => ({
      productId: pos.productId,
      contractId: pos.contractId,
      duration_months: pos.duration_months,
      quantity: pos.quantity,
      optional: pos.optional || false,
      total_cents: pos.total_cents || 0,
    })) ?? [],
  );

  const [offerFlatRates, setOfferFlatRates] = useState<
    Array<CreateOfferFlatRatesInput>
  >(
    currentOffer?.offerFlatRates.map(
      ({ id: _id, offer: _offer, ...fr }) => fr,
    ) ?? [],
  );

  const [showFlatRateForm, setShowFlatRateForm] = useState(false);

  const { createOffer, errorCreatingOffer, updateOffer } = useOfferHook();

  const [quoteIdWarning, setQuoteIdWarning] = useState<string | undefined>(
    undefined,
  );
  const [checkingQuoteId, setCheckingQuoteId] = useState(false);

  const checkQuoteId = async (id: string) => {
    if (!id) {
      setQuoteIdWarning(undefined);
      return;
    }

    setCheckingQuoteId(true);
    try {
      const result = await findOfferFilesByIdAction(id);
      setQuoteIdWarning(result.found ? "Datei existiert bereits" : undefined);
    } catch {
      setQuoteIdWarning(undefined);
    } finally {
      setCheckingQuoteId(false);
    }
  };

  const offerForm = useForm({
    defaultValues: getFormDefaults(currentOffer, {
      customerId: customers[0]?.id,
      contactPersonId: customers[0]?.contactPersons[0]?.id,
      userId: user?.id,
      supplierId: suppliers[0]?.id,
      language: locale,
    }),
    validators: {
      onChange: offerSchema,
      onMount: offerSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (isEdit) {
          await updateOffer({
            id: currentOffer.id,
            offer: { ...value, id: currentOffer!.id } as UpdateOfferInput,
            positions: offerProducts as UpdateOfferPositionInput[],
            flatRates: offerFlatRates as UpdateOfferFlatRatesInput[],
          });
        } else {
          await createOffer({
            offer: value as CreateOfferInput,
            positions: offerProducts as CreateOfferPositionInput[],
            flatRates: offerFlatRates as CreateOfferFlatRatesInput[],
          });
        }
        onClose();
      } catch (exception: any) {}
    },
  });

  const handleFormSubmit = (e: {
    preventDefault(): void;
    stopPropagation(): void;
  }) => {
    e.preventDefault();
    e.stopPropagation();
    offerForm.handleSubmit();
  };

  return (
    <ModalDialog onClose={onClose}>
      <ModalDialog.Header>
        <div className="flex items-center justify-between w-full mr-2">
          <h1 className="text-lg">
            {isEdit ? "Angebot bearbeiten" : "Angebot erstellen"}
          </h1>

          <offerForm.Field
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
            <offerForm.Field
              name="customerId"
              children={(field) => (
                <div className="flex-1">
                  <Select
                    label="Kunde"
                    error={getFormError(field.state.meta.errors)}
                    value={field.state.value as string}
                    onChange={(e) => {
                      const newCustomerId = e.target.value;
                      field.handleChange(newCustomerId);
                      const newCustomer = customers.find(
                        (c: Customer) => c.id === newCustomerId,
                      );
                      offerForm.setFieldValue(
                        "contactPersonId",
                        newCustomer?.contactPersons[0]?.id ?? "",
                      );
                    }}
                  >
                    {customers?.map((customer: Customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.companyName}
                      </option>
                    ))}
                    {customers.length <= 0 && <option value="">None</option>}
                  </Select>
                </div>
              )}
            />

            <offerForm.Field
              name="contactPersonId"
              children={(field) => (
                <div className="flex-1">
                  <offerForm.Subscribe
                    selector={(state) => state.values.customerId}
                    children={(customerId) => {
                      const selectedCustomer = customers?.find(
                        (c: Customer) => c.id === customerId,
                      );
                      const contactPersons =
                        selectedCustomer?.contactPersons ?? [];

                      return (
                        <Select
                          label="Ansprechpartner Kunde"
                          value={field.state.value as string}
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

            <offerForm.Field
              name="userId"
              children={(field) => (
                <div className="flex-1">
                  <Select
                    label="Unser Ansprechpartner"
                    value={field.state.value as string}
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
            <offerForm.Field
              name="quoteId"
              children={(field) => (
                <div className="flex-1 grid gap-2 items-center">
                  <Input
                    label="AG-Nr."
                    value={field.state.value as string}
                    warning={
                      quoteIdWarning ?? getFormError(field.state.meta.errors)
                    }
                    warningTooltip={checkingQuoteId ? "Prüfe..." : undefined}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      setQuoteIdWarning(undefined);
                    }}
                    onBlur={() => checkQuoteId(field.state.value as string)}
                  />
                </div>
              )}
            />

            <offerForm.Field
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
                    {suppliers?.map((supplier: Supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
            />

            <offerForm.Field
              name="paymentTerm"
              children={(field) => (
                <div className="flex-1 grid gap-2">
                  <Input
                    label="Zahlungsbedingung"
                    size="sm"
                    placeholder="Zahlungsbedingung..."
                    error={getFormError(field.state.meta.errors)}
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4">
            <offerForm.Field
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

            <offerForm.Field
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
            offerProducts={offerProducts}
            setOfferProducts={setOfferProducts}
          />

          <hr className="text-gray-200" />

          <div className="grid gap-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-medium text-gray-700">
                Pauschalen
              </span>
              <Button
                variant="link"
                size="fit_sm"
                disabled={showFlatRateForm}
                icon={<Plus className="size-4" />}
                onClick={() => setShowFlatRateForm(true)}
              >
                Pauschale hinzufügen
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              {offerFlatRates.map((flatRate, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-(--subtle-50) border border-(--border) px-3 py-2 rounded-md"
                >
                  <div className="grid">
                    <p className="flex items-center gap-1 text-sm">
                      {flatRate.quantity} <X className="size-3" />{" "}
                      {localized(
                        flatRate.flatRate.translations,
                        locale,
                        "name",
                      )}
                    </p>
                    <p className="text-xs text-(--text-secondary)">
                      {formatEur(flatRate.total_cents)}
                    </p>
                  </div>
                  <div>
                    <Button
                      type="button"
                      size="xs"
                      variant="secondary"
                      icon={<Trash className="size-3" />}
                      iconOnly
                      onClick={() =>
                        setOfferFlatRates((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                    />
                  </div>
                </div>
              ))}

              {showFlatRateForm && (
                <OfferFlatRateForm
                  flatRates={flatRates}
                  saveFn={(data) => {
                    setOfferFlatRates((prev) => [...prev, data]);
                    setShowFlatRateForm(false);
                  }}
                  cancelFn={() => setShowFlatRateForm(false)}
                />
              )}
            </div>
          </div>
        </form>
      </ModalDialog.Content>
      <ModalDialog.Footer>
        <div className="w-full flex items-center justify-between">
          <p className="text-(--destructive)">
            {errorCreatingOffer && `${errorCreatingOffer.message}`}
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
            <offerForm.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
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
