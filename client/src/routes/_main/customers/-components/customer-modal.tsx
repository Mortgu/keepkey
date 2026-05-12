import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

import { Plus, Trash2 } from "lucide-react";

import ContactPersonForm from "./contact-person-form";

import { useCustomerHook } from "@/hooks";
import { Input, Button, ModalDialog } from "@/components";
import type { ContactPerson, CreateContactPersonInput, Customer } from "@/types";

interface CustomerModalProps {
  open: boolean;
  cancelFn: () => void;
  currentCustomer?: Customer | null;
}

const customerSchema = z.object({
  customerId: z.string().min(1, "min. 1 Zeichen!"),
  companyName: z.string().min(1, "min. 1 Zeichen!"),
  email: z.email(),

  street: z.string(),
  city: z.string(),
  plz: z.string(),
  phone: z.string(),
});

export default function CustomerModal({
  open,
  cancelFn,
  currentCustomer = null,
}: CustomerModalProps) {
  const isEdit = currentCustomer !== null;

  const { updateCustomer, createCustomer, errorCreatingCustomer } =
    useCustomerHook();

  const [contactPersons, setContactPersons] = useState<CreateContactPersonInput[]>(
    currentCustomer?.contactPersons?.map(({ salutation, firstName, lastName, email }) => ({
      customerId: currentCustomer.id,
      salutation,
      firstName,
      lastName,
      email: email ?? undefined,
    })) ?? []);

  const [showContactForm, setShowContactForm] = useState(false);

  const customerForm = useForm({
    defaultValues: {
      customerId: currentCustomer?.customerId ?? "",
      companyName: currentCustomer?.companyName ?? "",
      email: currentCustomer?.email ?? "",

      street: currentCustomer?.street || "",
      city: currentCustomer?.city || "",
      plz: currentCustomer?.plz || "",
      phone: currentCustomer?.phone || "",
    },
    validators: {
      onChange: customerSchema,
    },
    onSubmit: ({ value }) => {
      const body = { ...value, contactPersons };

      if (isEdit) {
        try {
          updateCustomer({ id: currentCustomer.id, body });
          cancelFn();
        } catch (exception: any) { }
      } else {
        try {
          createCustomer(body);
          cancelFn();
        } catch (exception: any) { }
      }
    },
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    customerForm.handleSubmit();
  };

  const handleAddContactPerson = (data: CreateContactPersonInput) => {
    setContactPersons((prev) => [...prev, data]);
    setShowContactForm(false);
  };

  const handleRemoveContactPerson = (index: number) => {
    setContactPersons((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <ModalDialog open={open} cancelFn={cancelFn}>
      <ModalDialog.Header>
        <h1 className="text-lg">
          {isEdit && "Kunden bearbeiten"}
          {!isEdit && "Neuen Kunden anlegen"}
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
            <customerForm.Field name="customerId" children={(field) => (
              <div className="flex gap-2">
                <Input id={field.name} label="Kunden-Nr." input_size="sm"
                  value={field.state.value} error={field.state.meta.errors[0]?.message}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )} />

            <customerForm.Field name="companyName" children={(field) => (
              <div className="flex-3 grid gap-2">
                <Input id={field.name} label="Firmenname" input_size="sm"
                  value={field.state.value} error={field.state.meta.errors[0]?.message}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )} />
          </div>

          <div className="flex items-center gap-4">
            <customerForm.Field name="email" children={(field) => (
              <div className="flex-2 grid gap-2">
                <Input id={field.name} label="E-Mail" input_size="sm"
                  value={field.state.value} error={field.state.meta.errors[0]?.message}

                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )} />

            <customerForm.Field name="phone" children={(field) => (
              <div className="flex-2 grid gap-2">
                <Input id={field.name} label="Telefonnummer" input_size="sm"
                  value={field.state.value} error={field.state.meta.errors[0]?.message}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )} />
          </div>

          <div className="flex items-center gap-4">
            <customerForm.Field name="street" children={(field) => (
              <div className="flex-2 grid gap-2">
                <Input id={field.name} input_size="sm" label="Straße"
                  value={field.state.value} error={field.state.meta.errors[0]?.message}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )} />

            <customerForm.Field name="city" children={(field) => (
              <div className="flex-2 grid gap-2">
                <Input id={field.name} input_size="sm" label="Stadt"
                  value={field.state.value} error={field.state.meta.errors[0]?.message}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )} />

            <customerForm.Field name="plz" children={(field) => (
              <div className="flex-1 grid gap-2">
                <Input id={field.name} input_size="sm" label="Postleitzahl"
                  value={field.state.value} error={field.state.meta.errors[0]?.message}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )} />
          </div>

          <hr className="h-px text-transparent bg-gray-200" />

          <div className="flex flex-col gap-4">
            <div className="w-full">
              <Button variant="link" type="button" size="fit_sm" disabled={showContactForm}
                icon={<Plus className="size-4" />} onClick={() => setShowContactForm(true)} className="float-right">
                Kontaktperson hinzufügen
              </Button>
            </div>

            {contactPersons.length === 0 && !showContactForm && (
              <p className="text-sm text-gray-500 text-center py-2">
                Noch keine Kontaktperson
              </p>
            )}

            <div className="flex flex-col gap-2 w-full">
              {contactPersons.map((cp, index) => {
                const { salutation, firstName, lastName, email } = cp;

                return (
                  <div key={index} className="flex items-center justify-between bg-(--subtle-50) border border-(--border) rounded-md px-3 py-2">
                    <div className="grid">
                      <p className="text-sm font-semibold">{salutation} {firstName} {lastName}</p>
                      <p className="text-sm text-(--text-secondary)">{email}</p>
                    </div>

                    <Button variant="secondary" icon={<Trash2 className="size-3.5" />} iconOnly
                      onClick={() => handleRemoveContactPerson(index)} />
                  </div>
                )
              })}

              {showContactForm && (
                <ContactPersonForm onSave={handleAddContactPerson} onCancel={() => setShowContactForm(false)} />
              )}
            </div>
          </div>
        </form>
      </ModalDialog.Content>
      <ModalDialog.Footer>
        <Button onClick={cancelFn} variant="secondary" size="xs">
          Abbrechen
        </Button>
        <customerForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
          <Button size="xs" form="customer-form" disabled={!canSubmit} loading={isSubmitting}>
            Speichern
          </Button>
        )} />
      </ModalDialog.Footer>
    </ModalDialog>
  );
}
