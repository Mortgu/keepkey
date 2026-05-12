import { z } from "zod";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";

import { Loader, Plus, Trash, X } from "lucide-react";

import { type OfferProductInput } from "./offer-product-form";
import OfferFlatRateForm from "./offer-flat-rate-form";

import {
  useCustomerHook,
  useFlatRateHook,
  useUserHook,
  useSupplierHook,
  useOfferHook
} from "@/hooks";
import { Button, Input, ModalDialog, Select } from "@/components";

import type {
  Offer,
  User,
  Supplier,
  Customer,
  ContactPerson,
  CreateOfferInput,
  CreateOfferPositionInput,
  CreateOfferFlatRatesInput,
  UpdateOfferInput,
  UpdateOfferPositionInput,
  UpdateOfferFlatRatesInput,
} from "@/types";

import { formatEur } from "@/utils/utils";
import ProductModalSection from "./modal-items/product-section";

interface OfferModalProps {
  open: boolean;
  cancelFn: () => void;
  currentOffer?: Offer;
}

export const offerSchema = z.object({
  customerId: z.string().min(1, "Required!"),
  contactPersonId: z.string().min(1, "Required!"),
  userId: z.string().min(1, "Required!"),
  quoteId: z.string().min(1, "Required!"),

  supplierId: z.string().nullable(),
  paymentTerm: z.string(),

  validUntil: z.string().datetime().nullable(),
  requestFrom: z.string().datetime().nullable(),
});

export default function OfferModal({ open, cancelFn, currentOffer }: OfferModalProps) {
  const isEdit = currentOffer !== undefined;

  const { customers } = useCustomerHook();
  const { suppliers } = useSupplierHook();
  const { users } = useUserHook();
  const { flatRates } = useFlatRateHook();

  const [offerProducts, setOfferProducts] = useState<OfferProductInput[]>(
    currentOffer?.offerPositions.map((pos) => ({
      productId: pos.productId,
      contractId: pos.contractId,
      duration_months: pos.duration_months,
      quantity: pos.quantity,
      optional: pos.optional ?? false,
      total_cents: pos.total_cents ?? 0,
    })) ?? []
  );

  const [offerFlatRates, setOfferFlatRates] = useState<CreateOfferFlatRatesInput[]>(
    currentOffer?.offerFlatRates.map(({ id: _id, offer: _offer, ...fr }) => fr) ?? []
  );

  const [showFlatRateForm, setShowFlatRateForm] = useState(false);

  const { createOffer, errorCreatingOffer, updateOffer } = useOfferHook();

  const offerForm = useForm({
    defaultValues: {
      customerId: currentOffer?.customerId ?? customers[0]?.id ?? '',
      contactPersonId: currentOffer?.contactPersonId ?? customers[0]?.contactPersons[0]?.id ?? '',
      userId: currentOffer?.userId ?? users[0]?.id ?? '',
      quoteId: currentOffer?.quoteId ?? '',

      supplierId: currentOffer?.supplierId ?? null, //suppliers[0]?.id
      paymentTerm: currentOffer?.paymentTerm ?? '30 Tage',

      validUntil: currentOffer?.validUntil ?? null,
      requestFrom: currentOffer?.requestFrom ?? null,
    },
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
        cancelFn();
      } catch (exception: any) { }
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
    <ModalDialog open={open} cancelFn={cancelFn}>
      <ModalDialog.Header>
        <h1 className="text-lg">Neues Angebot erstellen</h1>
      </ModalDialog.Header>
      <ModalDialog.Content>
        <form id="offer-form" onSubmit={handleFormSubmit} className="grid gap-4">
          <div className="flex flex-wrap justify-between items-center gap-4">

            <offerForm.Field name="customerId" children={(field) => (
              <div className="flex-1">
                <Select label="Kunde" error={field.state.meta.errors.map((e) => e?.message).join(" & ")}
                  value={field.state.value as string} onChange={(e) => field.handleChange(e.target.value)} >
                  {customers?.map((customer: Customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.companyName}
                    </option>
                  ))}
                  {customers.length <= 0 && <option value="">None</option>}
                </Select>
              </div>
            )} />

            {/* Ihr Ansprechpartner */}
            <offerForm.Field name="contactPersonId" children={(field) => (
              <div className="flex-1">
                <offerForm.Subscribe selector={(state) => state.values.customerId} children={(customerId) => {
                  const selectedCustomer = customers?.find((c: Customer) => c.id === customerId);
                  const contactPersons = selectedCustomer?.contactPersons ?? [];

                  return (
                    <Select label="Ansprechpartner Kunde" value={field.state.value as string}
                      error={field.state.meta.errors.map((e) => e?.message).join(" & ")}
                      onChange={(e) => field.handleChange(e.target.value)} disabled={!customerId}>
                      {contactPersons.map((cp: ContactPerson) => (
                        <option key={cp.id} value={cp.id}>
                          {cp.firstName} {cp.lastName}
                        </option>
                      ))}
                      {contactPersons.length <= 0 && <option value="">None</option>}
                    </Select>
                  );
                }}
                />
              </div>
            )}
            />

            <offerForm.Field name="userId" children={(field) => (
              <div className="flex-1">
                <Select label="Unser Ansprechpartner" value={field.state.value as string}
                  error={field.state.meta.errors.map((e) => e?.message).join(" & ")}
                  onChange={(e) => field.handleChange(e.target.value)}>
                  {users.map((user: User) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                  {users.length <= 0 && <option value="">None</option>}
                </Select>
              </div>
            )} />

          </div>

          <div className="flex flex-wrap justify-between items-center gap-4">
            <offerForm.Field name="quoteId" children={(field) => (
              <div className="flex-1 grid gap-2 items-center">
                <Input label="AG-Nr." value={field.state.value as string}
                  error={field.state.meta.errors.map((e) => e?.message).join(" & ")}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
            />

            {/* Lieferant / Supplier */}
            <offerForm.Field name="supplierId" children={(field) => (
              <div className="flex-1 grid gap-2 items-center">
                <Select label="Lieferant" value={field.state.value as string}
                  error={field.state.meta.errors.map((e) => e?.message).join(" & ")}
                  onChange={(e) => field.handleChange(e.target.value)}>
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

            {/* Zahlungsbedingung */}
            <offerForm.Field name="paymentTerm" children={(field) => (
              <div className="flex-1 grid gap-2">

                <Input label="Zahlungsbedingung" input_size="sm" placeholder="Zahlungsbedingung..."
                  error={field.state.meta.errors.map((e) => e?.message).join(" & ")}
                  value={field.state.value as string}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
            />
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4">
            {/* Angebot Gültig bis */}
            <offerForm.Field name="validUntil" children={(field) => (
              <div className="flex-1 grid gap-2">

                <Input label="Angebot gültig bis" type="date" input_size="sm" placeholder="Gültig bis..."
                  error={field.state.meta.errors.map((e) => e?.message).join(" & ")}
                  value={field.state.value?.split('T')[0] ?? ''}
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

            {/* Ihre Anfrage vom */}
            <offerForm.Field name="requestFrom" children={(field) => (
              <div className="flex-1 grid gap-2">

                <Input label="Ihre Anfrage vom" type="date" input_size="sm" placeholder="Ihre Anfrage vom..."
                  error={field.state.meta.errors.map((e) => e?.message).join(" & ")}
                  value={field.state.value?.split('T')[0] ?? ''}
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
            )} />
          </div>

          <ProductModalSection offerProducts={offerProducts} setOfferProducts={setOfferProducts} />

          <hr className="text-gray-200" />

          <div className="grid gap-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-medium text-gray-700">
                Pauschalen
              </span>
              <Button variant="link" size="fit_sm" disabled={showFlatRateForm}
                icon={<Plus className="size-4" />} onClick={() => setShowFlatRateForm(true)}>
                Pauschale hinzufügen
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              {offerFlatRates.map((flatRate, index) => (
                <div key={index} className="flex items-center justify-between bg-(--subtle-50) border border-(--border) px-3 py-2 rounded-md">
                  <div className="grid">
                    <p className="flex items-center gap-1 text-sm">{flatRate.quantity} <X className="size-3" /> {flatRate.flatRate.name}</p>
                    <p className="text-xs text-(--text-secondary)">{formatEur(flatRate.total_cents)}</p>
                  </div>
                  <div>
                    <Button type="button" size="xs" variant="secondary"
                      icon={<Trash className="size-3" />} iconOnly
                      onClick={() => setOfferProducts((prev) => prev.filter((_, i) => i !== index))} />
                  </div>
                </div>
              ))}

              {showFlatRateForm && (
                <OfferFlatRateForm flatRates={flatRates} saveFn={(data) => {
                  setOfferFlatRates((prev) => [...prev, data]);
                  setShowFlatRateForm(false);
                }} cancelFn={() => setShowFlatRateForm(false)} />
              )}
            </div>
          </div>

        </form>
      </ModalDialog.Content>
      <ModalDialog.Footer>
        <div className="w-full flex items-center justify-between">
          <p className="text-(--destructive)">
            {errorCreatingOffer && (
              `${errorCreatingOffer.message}`
            )}
          </p>
          <div className="flex gap-2">
            <Button onClick={cancelFn} type="button" size="sm" variant="secondary">
              Abbrechen
            </Button>
            <offerForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
              <Button form="offer-form" disabled={!canSubmit} type="submit" size="sm">
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
