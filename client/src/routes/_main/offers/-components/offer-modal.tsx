import { useContracts } from "@/hooks/contract";
import { useCustomers } from "@/hooks/customer";
import { useProducts } from "@/hooks/product";
import { useForm } from "@tanstack/react-form";
import { Loader, Plus, Trash, Trash2, X } from "lucide-react";
import { useState } from "react";
import OfferProductForm, { type OfferProductInput } from "./offer-product-form";
import OfferFlatRateForm from "./offer-flat-rate-form";
import { z } from "zod";
import { useOffer } from "@/hooks/offer";
import { useSupplier } from "@/hooks/supplier";
import { Button, Input, Checkbox, ModalDialog, Select } from "@/components";
import { useFlatRates } from "@/hooks/flatrate.ts";
import { useUser } from "@/hooks/user";

import type {
  Offer,
  User,
  Supplier,
  Customer,
  Product,
  ContactPerson,
  CreateOfferInput,
  CreateOfferPositionInput,
  CreateOfferFlatRatesInput,
  UpdateOfferInput,
  UpdateOfferPositionInput,
  UpdateOfferFlatRatesInput,
} from "@/types";
import { formatEur } from "@/utils/utils";

interface OfferModalProps {
  open: boolean;
  cancelFn: () => void;
  currentOffer?: Offer;
}

export const offerSchema = z.object({
  customerId: z.string().min(1, "Required!"),
  contactPersonId: z.string().min(1, "Required!"),
  userId: z.string().min(1, "Required!"),
  voucherId: z.string().min(1, "Required!"),

  supplierId: z.string().nullable(),
  paymentTerm: z.string().nullable(),

  validUntil: z.string().datetime().nullable(),
  requestFrom: z.string().datetime().nullable(),
});

export default function OfferModal({ open, cancelFn, currentOffer }: OfferModalProps) {
  if (!open) return null;

  const isEdit = currentOffer !== undefined;

  const { customers } = useCustomers();
  const { products } = useProducts();
  const { contracts } = useContracts();
  const { suppliers } = useSupplier();
  const { users } = useUser();
  const { flatRates } = useFlatRates();

  const [offerProducts, setOfferProducts] = useState<OfferProductInput[]>(
    currentOffer?.offerPositions.map((pos) => ({
      productId: pos.productId,
      contractId: pos.contractId,
      duration_months: pos.duration_months,
      quantity: pos.quantity,
      optional: pos.optional ?? false,
    })) ?? []
  );

  const [offerFlatRates, setOfferFlatRates] = useState<CreateOfferFlatRatesInput[]>(
    currentOffer?.offerFlatRates.map(({ id: _id, offer: _offer, ...fr }) => fr) ?? []
  );

  const [showProductForm, setShowProductForm] = useState(false);
  const [showFlatRateForm, setShowFlatRateForm] = useState(false);

  const { createOffer, errorCreatingOffer, updateOffer } = useOffer();

  const offerForm = useForm({
    defaultValues: {
      customerId: currentOffer?.customerId ?? customers[0]?.id ?? '',
      contactPersonId: currentOffer?.contactPersonId ?? '',
      userId: currentOffer?.userId ?? '',
      voucherId: currentOffer?.voucherId ?? '',

      supplierId: currentOffer?.supplierId ?? null,
      paymentTerm: currentOffer?.paymentTerm ?? null,

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
                  <option value="">None</option>
                  {customers?.map((customer: Customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.companyName}
                    </option>
                  ))}
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
                      <option value="">None</option>
                      {contactPersons.map((cp: ContactPerson) => (
                        <option key={cp.id} value={cp.id}>
                          {cp.firstName} {cp.lastName}
                        </option>
                      ))}
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
                  <option value="">None</option>
                  {users.map((user: User) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </Select>
              </div>
            )} />

          </div>

          <div className="flex flex-wrap justify-between items-center gap-4">
            <offerForm.Field name="voucherId" children={(field) => (
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

          <hr className="text-gray-200" />

          <div className="grid gap-4">
            <div className="flex items-center justify-between w-full">
              <Checkbox label="Vergleichen?" />
              <Button variant="link" size="fit_sm" disabled={showProductForm} icon={<Plus className="size-4" />}
                onClick={() => setShowProductForm(true)}>
                Produkt hinzufügen
              </Button>
            </div>

            {offerProducts.length === 0 && !showProductForm && (
              <p className="text-sm text-gray-500 text-center py-2">
                Noch kein Produkt hinzugefügt
              </p>
            )}

            <div className="flex flex-col gap-2">
              {offerProducts.map((op, index) => {
                const product = products.find((f) => f.id == op.productId);
                const contract = contracts.find((c) => c.id == op.contractId);

                if (!product || !contract) return null;

                return (
                  <div key={index} className="flex items-center justify-between bg-(--subtle-50) border border-(--border) px-3 py-2 rounded-md">
                    <div className="grid">
                      <p className="flex items-center gap-1 text-sm">{op.quantity} <X className="size-3" /> {product.name}</p>
                      <div className="flex items-center">
                        <p className="text-xs text-(--text-secondary)">{contract.name} | {op.duration_months} Monate</p>
                      </div>
                    </div>

                    <div>
                      <Button type="button" size="xs" variant="secondary"
                        icon={<Trash className="size-3" />} iconOnly
                        onClick={() => setOfferProducts((prev) => prev.filter((_, i) => i !== index))} />
                    </div>
                  </div>
                )
              })}

              {showProductForm && (
                <OfferProductForm
                  products={products ?? []}
                  contracts={contracts ?? []}
                  onSave={(data) => {
                    setOfferProducts((prev) => [...prev, data]);
                    setShowProductForm(false);
                  }}
                  onCancel={() => setShowProductForm(false)}
                />
              )}
            </div>
          </div>

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
