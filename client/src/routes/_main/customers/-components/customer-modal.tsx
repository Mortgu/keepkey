import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import type { Customer } from "@/types";
import { useCustomerHook } from "@/hooks";
import { Button, Input, ModalDialog, Select } from "@/components";
import { getFormError } from "@/lib/utils";
import {
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  LANGUAGE_OPTIONS,
  findCountryByName,
} from "@/lib/countries";

interface CustomerModalProps {
  onClose: () => void;
  currentCustomer?: Customer | null;
}

const customerSchema = z.object({
  customerId: z
    .union([z.string(), z.undefined()])
    .transform((val) => (val === undefined ? null : val)),
  companyName: z.string().min(1, "min. 1 Zeichen!"),
  email: z.email(),
  invoiceEmail: z
    .union([z.email(), z.undefined()])
    .transform((val) => (val === undefined ? null : val)),

  country: z.string(),
  street: z.string(),
  city: z.string(),
  plz: z.string(),
  phone: z.string(),

  language: z.enum(["DE", "EN"]),
  currency: z.enum(["EUR", "RAND", "DOLLAR", "CHF"]),
  taxRate: z.number(),
});

export default function CustomerModal({
  onClose,
  currentCustomer = null,
}: CustomerModalProps) {
  const isEdit = currentCustomer !== null;

  const { updateCustomer, createCustomer, errorCreatingCustomer } =
    useCustomerHook();

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
      plz: currentCustomer?.plz || "",
      phone: currentCustomer?.phone || "",

      language: currentCustomer?.language ?? initialCountry.language,
      currency: currentCustomer?.currency ?? initialCountry.currency,
      taxRate: currentCustomer?.taxRate ?? initialCountry.taxRate,
    },
    validators: {
      onChange: customerSchema,
    },
    onSubmit: ({ value }) => {
      if (isEdit) {
        try {
          updateCustomer({ id: currentCustomer.id, body: value });
          onClose();
        } catch (exception: any) {
          console.error(exception);
        }
      } else {
        try {
          createCustomer({ body: value });
          onClose();
        } catch (exception: any) {
          console.error(exception);
        }
      }
    },
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    customerForm.handleSubmit();
  };

  return (
    <ModalDialog onClose={onClose}>
      <ModalDialog.Header>
        <h1 className="text-lg">
          {isEdit ? "Kunden bearbeiten" : "Neuen Kunden anlegen"}
        </h1>
      </ModalDialog.Header>
      <ModalDialog.Content>
        {errorCreatingCustomer && (
          <div className="p-4 bg-red-50">
            <p>{errorCreatingCustomer?.message}</p>
          </div>
        )}

        <form id="customer-form" onSubmit={handleSubmit} className="grid gap-4">
          <div className="flex items-center gap-4">
            <customerForm.Field
              name="customerId"
              children={(field) => (
                <div className="flex gap-2">
                  <Input
                    id={field.name}
                    label="Kunden-Nr."
                    size="sm"
                    value={field.state.value ?? ""}
                    error={getFormError(field.state.meta.errors)}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />

            <customerForm.Field
              name="companyName"
              children={(field) => (
                <div className="flex-3 grid gap-2">
                  <Input
                    id={field.name}
                    label="Firmenname"
                    size="sm"
                    value={field.state.value}
                    error={getFormError(field.state.meta.errors)}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />

            <customerForm.Field
              name="phone"
              children={(field) => (
                <div className="flex-2 grid gap-2">
                  <Input
                    id={field.name}
                    label="Telefonnummer"
                    size="sm"
                    value={field.state.value}
                    error={getFormError(field.state.meta.errors)}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />
          </div>

          <div className="flex items-center gap-4">
            <customerForm.Field
              name="email"
              children={(field) => (
                <div className="flex-2 grid gap-2">
                  <Input
                    id={field.name}
                    label="E-Mail"
                    size="sm"
                    value={field.state.value}
                    error={getFormError(field.state.meta.errors)}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />

            <customerForm.Field
              name="invoiceEmail"
              children={(field) => (
                <div className="flex-2 grid gap-2">
                  <Input
                    id={field.name}
                    label="Rechnungs E-Mail"
                    size="sm"
                    value={field.state.value ?? ""}
                    error={getFormError(field.state.meta.errors)}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />
          </div>

          <div className="flex items-center gap-4">
            <customerForm.Field
              name="country"
              children={(field) => (
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
              )}
            />

            <customerForm.Field
              name="language"
              children={(field) => (
                <div className="flex-1 grid gap-2">
                  <Select
                    id={field.name}
                    size="sm"
                    label="Sprache"
                    options={LANGUAGE_OPTIONS}
                    value={field.state.value}
                    error={getFormError(field.state.meta.errors)}
                    onChange={(e) =>
                      field.handleChange(e.target.value as "DE" | "EN")
                    }
                  />
                </div>
              )}
            />

            <customerForm.Field
              name="currency"
              children={(field) => (
                <div className="flex-1 grid gap-2">
                  <Select
                    id={field.name}
                    size="sm"
                    label="Währung"
                    options={CURRENCY_OPTIONS}
                    value={field.state.value}
                    error={getFormError(field.state.meta.errors)}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value as "EUR" | "RAND" | "DOLLAR" | "CHF",
                      )
                    }
                  />
                </div>
              )}
            />

            <customerForm.Field
              name="taxRate"
              children={(field) => (
                <div className="flex-1 grid gap-2">
                  <Input
                    id={field.name}
                    size="sm"
                    label="Steuersatz (%)"
                    type="number"
                    step="0.1"
                    value={field.state.value}
                    error={getFormError(field.state.meta.errors)}
                    onChange={(e) =>
                      field.handleChange(e.target.valueAsNumber || 0)
                    }
                  />
                </div>
              )}
            />
          </div>

          <div className="flex items-center gap-4">
            <customerForm.Field
              name="street"
              children={(field) => (
                <div className="flex-2 grid gap-2">
                  <Input
                    id={field.name}
                    size="sm"
                    label="Straße"
                    value={field.state.value}
                    error={getFormError(field.state.meta.errors)}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />

            <customerForm.Field
              name="city"
              children={(field) => (
                <div className="flex-2 grid gap-2">
                  <Input
                    id={field.name}
                    size="sm"
                    label="Stadt"
                    value={field.state.value}
                    error={getFormError(field.state.meta.errors)}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />

            <customerForm.Field
              name="plz"
              children={(field) => (
                <div className="flex-1 grid gap-2">
                  <Input
                    id={field.name}
                    size="sm"
                    label="Postleitzahl"
                    value={field.state.value}
                    error={getFormError(field.state.meta.errors)}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />
          </div>
        </form>
      </ModalDialog.Content>
      <ModalDialog.Footer>
        <Button onClick={onClose} variant="secondary" size="sm">
          Abbrechen
        </Button>
        <customerForm.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              size="sm"
              form="customer-form"
              disabled={!canSubmit}
              loading={isSubmitting}
            >
              Speichern
            </Button>
          )}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
}
