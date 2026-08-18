import { useForm } from "@tanstack/react-form";
import { customerFormSchema } from "@keepit/schemas";
import type { Customer } from "@keepit/schemas";
import { FieldInput, FieldSelect, FormModal, NumberField, Select } from "@/components";
import { useCreateCustomer, useUpdateCustomer } from "@/hooks";
import {
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  LANGUAGE_OPTIONS,
  findCountryByName,
} from "@/lib/countries";
import { getFormError } from "@/lib/utils";

interface CustomerModalProps {
  onClose: () => void;
  currentCustomer?: Customer | null;
}

export default function CustomerModal({
  onClose,
  currentCustomer = null,
}: CustomerModalProps) {
  const isEdit = currentCustomer !== null;

  const { createCustomer, errorCreatingCustomer } = useCreateCustomer();
  const { updateCustomer } = useUpdateCustomer();

  const initialCountry = findCountryByName(currentCustomer?.country);

  const customerForm = useForm({
    defaultValues: {
      customerId: currentCustomer?.customerId ?? undefined,
      companyName: currentCustomer?.companyName ?? "",
      email: currentCustomer?.email ?? "",
      invoiceEmail: currentCustomer?.invoiceEmail ?? undefined,

      country: currentCustomer?.country || initialCountry.name,
      street: currentCustomer?.street || "",
      city: currentCustomer?.city || "",
      zip: currentCustomer?.zip || "",
      phone: currentCustomer?.phone || "",

      language: currentCustomer?.language ?? initialCountry.language,
      currency: currentCustomer?.currency ?? initialCountry.currency,
      taxRate: currentCustomer?.taxRate ?? initialCountry.taxRate,
    },
    validators: {
      onChange: customerFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (isEdit) {
        try {
          await updateCustomer({ customerId: currentCustomer.id, input: value });
          onClose();
        } catch (exception) {
          console.error(exception);
        }
      } else {
        try {
          await createCustomer({ input: value });
          onClose();
        } catch (exception) {
          console.error(exception);
        }
      }
    },
  });

  return (
    <FormModal
      form={customerForm}
      onClose={onClose}
      formId="customer-form"
      title={<h1 className="text-lg">{isEdit ? "Kunden bearbeiten" : "Neuen Kunden anlegen"}</h1>}
      error={
        errorCreatingCustomer ? (
          <div className="p-4 bg-red-50 mb-2">
            <p>{errorCreatingCustomer.message}</p>
          </div>
        ) : null
      }
    >
      <div className="flex items-center gap-4">
        <customerForm.Field name="customerId" children={(field) => (
          <div className="flex gap-2">
            <FieldInput field={field} label="Kunden-Nr." size="sm" />
          </div>
        )} />

        <customerForm.Field name="companyName" children={(field) => (
          <div className="flex-3 grid gap-2">
            <FieldInput field={field} label="Firmenname" size="sm" />
          </div>
        )} />

        <customerForm.Field name="phone" children={(field) => (
          <div className="flex-2 grid gap-2">
            <FieldInput field={field} label="Telefonnummer" size="sm" />
          </div>
        )} />
      </div>

      <div className="flex items-center gap-4">
        <customerForm.Field name="email" children={(field) => (
          <div className="flex-2 grid gap-2">
            <FieldInput field={field} label="E-Mail" size="sm" />
          </div>
        )} />

        <customerForm.Field name="invoiceEmail" children={(field) => (
          <div className="flex-2 grid gap-2">
            <FieldInput field={field} label="Rechnungs E-Mail" size="sm" />
          </div>
        )} />
      </div>

      <div className="flex items-center gap-4">
        <customerForm.Field name="country" children={(field) => (
          <div className="flex-2 grid gap-2">
            <Select
              id={field.name}
              size="sm"
              label="Land"
              options={COUNTRY_OPTIONS}
              placeholder="Land wählen"
              value={field.state.value}
              error={getFormError(field.state.meta.errors)}
              onChange={(e) => {
                const cfg = findCountryByName(e.target.value);
                field.handleChange(cfg.name);
                customerForm.setFieldValue("language", cfg.language);
                customerForm.setFieldValue("currency", cfg.currency);
                customerForm.setFieldValue("taxRate", cfg.taxRate);
              }}
            />
          </div>
        )} />

        <customerForm.Field name="language" children={(field) => (
          <div className="flex-1 grid gap-2">
            <FieldSelect field={field} size="sm" label="Sprache" options={LANGUAGE_OPTIONS} />
          </div>
        )} />

        <customerForm.Field name="currency" children={(field) => (
          <div className="flex-1 grid gap-2">
            <FieldSelect field={field} size="sm" label="Währung" options={CURRENCY_OPTIONS} />
          </div>
        )} />

        <customerForm.Field name="taxRate" children={(field) => (
          <div className="flex-1 grid gap-2">
            <NumberField
              value={field.state.value}
              min={0}
              max={100}
              step={0.1}
              onValueChange={(value) => field.handleChange(value ?? 0)}
              label="Steuersatz (%)" />
          </div>
        )} />
      </div>

      <div className="flex items-center gap-4">
        <customerForm.Field name="street" children={(field) => (
          <div className="flex-2 grid gap-2">
            <FieldInput field={field} size="sm" label="Straße" />
          </div>
        )} />

        <customerForm.Field name="city" children={(field) => (
          <div className="flex-2 grid gap-2">
            <FieldInput field={field} size="sm" label="Stadt" />
          </div>
        )} />

        <customerForm.Field name="zip" children={(field) => (
          <div className="flex-1 grid gap-2">
            <FieldInput field={field} size="sm" label="Postleitzahl" />
          </div>
        )} />
      </div>
    </FormModal>
  );
}
