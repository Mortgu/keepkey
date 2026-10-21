import { useForm } from "@tanstack/react-form";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { createCustomerSchema } from "@keepit/schemas";
import { contactPersonNameFields } from "./contact/contact-person-fields";
import type { Customer } from "@keepit/schemas";
import type { TranslationKey } from "@/i18n";
import { Button, Dialog, FieldInput, FieldSelect, NumberField, Select } from "@/components";
import { useCreateCustomer, useFormError, useLocale, useUpdateCustomer } from "@/hooks";
import {
  CURRENCY_OPTIONS,
  countryOptions,
  findCountryByName,
  languageOptions,
} from "@/lib/countries";

const invalidEmail = "validation.email" satisfies TranslationKey;

/* Strikte UI-Validierung für das Kunden-Formular. Bewusst strenger als
 * createCustomerSchema (das dem nullable DB/Server-Modell folgt): email
 * required + formatgeprüft, Adressen required. customerId wird hier explizit
 * als string | undefined überschrieben (nicht geerbt);
 * language/currency werden vom Basis-Schema geerbt (enum). Die Normalisierung
 * von null/"" übernimmt das Server-Schema.
 *
 * Meldungen sind Übersetzungsschlüssel und werden erst bei der Anzeige
 * aufgelöst (useFormError) — deshalb liegt das Schema im Client. */
const customerFormSchema = createCustomerSchema.extend({
  customerId: z.union([z.string(), z.undefined()]),
  companyName: z.string().min(1, "validation.minOneChar" satisfies TranslationKey),
  email: z.email(invalidEmail),
  invoiceEmail: z.union([z.email(invalidEmail), z.undefined()]),
  street: z.string(),
  city: z.string(),
  zip: z.string(),
  phone: z.string(),
  contactPersons: z.array(z.object({
    ...contactPersonNameFields,
    email: z.union([z.literal(""), z.email(invalidEmail)]),
  })),
});
type CustomerFormInput = z.infer<typeof customerFormSchema>;

interface CustomerModalProps {
  onClose: () => void;
  currentCustomer?: Customer | null;
}

export default function CustomerModal({
  onClose,
  currentCustomer = null,
}: CustomerModalProps) {
  const { t } = useTranslation();
  const formError = useFormError();
  const language = useLocale();
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

      // Nur beim Anlegen; bestehende Ansprechpartner pflegt das Kontakt-Modal.
      contactPersons: [] as CustomerFormInput["contactPersons"],
    },
    validators: {
      onChange: customerFormSchema,
    },
    onSubmit: async ({ value }) => {
      const { contactPersons, ...customer } = value;

      if (isEdit) {
        try {
          await updateCustomer({ customerId: currentCustomer.id, input: customer });
          onClose();
        } catch (exception) {
          console.error(exception);
        }
      } else {
        try {
          await createCustomer({ input: { ...customer, contactPersons } });
          onClose();
        } catch (exception) {
          console.error(exception);
        }
      }
    },
  });

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {

    e.preventDefault();

    e.stopPropagation();

    customerForm.handleSubmit();

  };


  return (
    <Dialog
      defaultOpen
      onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}
    >
      <Dialog.Header title={isEdit ? t("customer.edit") : t("customer.modal.createTitle")} />
      <Dialog.Body>
        {
          errorCreatingCustomer ? (
            <div className="p-4 bg-red-50 mb-2">
              <p>{errorCreatingCustomer.message}</p>
            </div>
          ) : null
        }
        <form id="customer-form" onSubmit={handleSubmit} className="grid gap-4">
          <div className="flex items-center gap-4">
            <customerForm.Field name="customerId" children={(field) => (
              <div className="flex gap-2">
                <FieldInput field={field} label={t("customer.modal.customerNumber")} size="sm" />
              </div>
            )} />

            <customerForm.Field name="companyName" children={(field) => (
              <div className="flex-3 grid gap-2">
                <FieldInput field={field} label={t("customer.modal.companyName")} size="sm" />
              </div>
            )} />

            <customerForm.Field name="phone" children={(field) => (
              <div className="flex-2 grid gap-2">
                <FieldInput field={field} label={t("customer.modal.phone")} size="sm" />
              </div>
            )} />
          </div>

          <div className="flex items-center gap-4">
            <customerForm.Field name="email" children={(field) => (
              <div className="flex-2 grid gap-2">
                <FieldInput field={field} label={t("customer.modal.email")} size="sm" />
              </div>
            )} />

            <customerForm.Field name="invoiceEmail" children={(field) => (
              <div className="flex-2 grid gap-2">
                <FieldInput field={field} label={t("customer.modal.invoiceEmail")} size="sm" />
              </div>
            )} />
          </div>

          <div className="flex items-center gap-4">
            <customerForm.Field name="country" children={(field) => (
              <div className="flex-2 grid gap-2">
                <Select
                  id={field.name}
                  size="sm"
                  label={t("common.country")}
                  options={countryOptions(language)}
                  placeholder={t("customer.modal.countryPlaceholder")}
                  value={field.state.value}
                  error={formError(field.state.meta.errors)}
                  onValueChange={(country) => {
                    const cfg = findCountryByName(country);
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
                <FieldSelect field={field} size="sm" label={t("common.language")} options={languageOptions(language)} />
              </div>
            )} />

            <customerForm.Field name="currency" children={(field) => (
              <div className="flex-1 grid gap-2">
                <FieldSelect field={field} size="sm" label={t("customer.modal.currency")} options={CURRENCY_OPTIONS} />
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
                  label={t("customer.modal.taxRate")} />
              </div>
            )} />
          </div>

          <div className="flex items-center gap-4">
            <customerForm.Field name="street" children={(field) => (
              <div className="flex-2 grid gap-2">
                <FieldInput field={field} size="sm" label={t("customer.modal.street")} />
              </div>
            )} />

            <customerForm.Field name="city" children={(field) => (
              <div className="flex-2 grid gap-2">
                <FieldInput field={field} size="sm" label={t("customer.modal.city")} />
              </div>
            )} />

            <customerForm.Field name="zip" children={(field) => (
              <div className="flex-1 grid gap-2">
                <FieldInput field={field} size="sm" label={t("customer.modal.zip")} />
              </div>
            )} />
          </div>

          {!isEdit && (
            <customerForm.Field name="contactPersons" mode="array" children={(field) => (
              <div className="grid gap-2 border-t border-gray-200 pt-4">
                <span className="text-sm text-gray-500">{t("customer.modal.contactPersons")}</span>

                {field.state.value.map((_, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <customerForm.Field name={`contactPersons[${index}].salutation`} children={(itemField) => (
                      <div className="flex-1 min-w-0 grid grid-cols-1 gap-2">
                        <FieldInput field={itemField} size="sm" label={t("customer.contact.salutation")} />
                      </div>
                    )} />
                    <customerForm.Field name={`contactPersons[${index}].firstName`} children={(itemField) => (
                      <div className="flex-2 min-w-0 grid grid-cols-1 gap-2">
                        <FieldInput field={itemField} size="sm" label={t("customer.contact.firstName")} />
                      </div>
                    )} />
                    <customerForm.Field name={`contactPersons[${index}].lastName`} children={(itemField) => (
                      <div className="flex-2 min-w-0 grid grid-cols-1 gap-2">
                        <FieldInput field={itemField} size="sm" label={t("customer.contact.lastName")} />
                      </div>
                    )} />
                    <customerForm.Field name={`contactPersons[${index}].email`} children={(itemField) => (
                      <div className="flex-3 min-w-0 grid grid-cols-1 gap-2">
                        <FieldInput field={itemField} size="sm" label={t("customer.modal.email")} />
                      </div>
                    )} />
                    <Button variant="secondary" size="sm" type="button" className="mt-6"
                      icon={<Trash2 className="size-4" />} iconOnly
                      aria-label={t("customer.modal.removeContactPerson")}
                      onClick={() => field.removeValue(index)} />
                  </div>
                ))}

                <Button type="button" variant="secondary" size="sm" className="justify-self-start"
                  icon={<Plus className="size-4" />}
                  onClick={() => field.pushValue({ salutation: "", firstName: "", lastName: "", email: "" })}>
                  {t("customer.modal.addContactPerson")}
                </Button>
              </div>
            )} />
          )}
        </form>
      </Dialog.Body>
      <Dialog.Footer>
        <Dialog.Close render={<Button variant="border" size="sm">{t("button.cancel")}</Button>} />
        <customerForm.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              form="customer-form"
              size="sm"
              disabled={!canSubmit}
              loading={isSubmitting}
            >
              {t("button.save")}
            </Button>
          )}
        />
      </Dialog.Footer>
    </Dialog>
  );
}
