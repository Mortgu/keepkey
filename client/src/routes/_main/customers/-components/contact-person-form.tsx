import { z } from "zod";
import { useForm } from "@tanstack/react-form";

import type {
  Contact
} from "@keepit/schemas";
import { FieldInput, FormModal } from "@/components";
import { useCreateCustomerContact, useUpdateCustomerContact } from "@/hooks";

const contactPersonSchema = z.object({
  salutation: z.string().min(1, "Anrede fehlt"),
  firstName: z.string().min(1, "Vorname fehlt"),
  lastName: z.string().min(1, "Nachname fehlt"),
  email: z.email().nullable(),
});

interface Props {
  cancelFn: () => void;

  currentCustomerId: string;
  currentContactPerson?: Contact | null;
}

export default function ContactPersonForm({ cancelFn, currentCustomerId, currentContactPerson }: Props) {
  const { createCustomerContact } = useCreateCustomerContact();
  const { updateCustomerContact } = useUpdateCustomerContact();

  const contactForm = useForm({
    defaultValues: {
      salutation: currentContactPerson?.salutation ?? '',
      firstName: currentContactPerson?.firstName ?? '',
      lastName: currentContactPerson?.lastName ?? '',
      email: currentContactPerson?.email ?? null,
    },
    validators: {
      onChange: contactPersonSchema,
      onMount: contactPersonSchema,
    },
    onSubmit: ({ value }) => {
      if (currentContactPerson) {
        updateCustomerContact({
          id: currentCustomerId,
          contactId: currentContactPerson.id,
          input: {
            salutation: value.salutation,
            firstName: value.firstName,
            lastName: value.lastName,
            email: value.email || "",
            customerId: currentCustomerId,
          }
        })
      } else {
        createCustomerContact({
          id: currentCustomerId,
          input: {
            salutation: value.salutation,
            firstName: value.firstName,
            lastName: value.lastName,
            email: value.email || "",
            customerId: currentCustomerId,
          }
        });
      }

      cancelFn();
    }
  });

  const isEditing = Boolean(currentContactPerson);

  return (
    <FormModal
      form={contactForm}
      onClose={cancelFn}
      formId="contact-person-form"
      title={<h1 className="text-lg">{isEditing ? "Kontaktperson bearbeiten" : "Kontaktperson hinzufügen"}</h1>}
    >
      <div className="flex items-center gap-2">
        <contactForm.Field name="salutation" children={(field) => (
          <FieldInput field={field} label="Anrede" className="bg-white" />
        )} />

        <contactForm.Field name="firstName" children={(field) => (
          <FieldInput field={field} label="Vorname" className="bg-white" />
        )} />

        <contactForm.Field name="lastName" children={(field) => (
          <FieldInput field={field} label="Nachname" className="bg-white" />
        )} />
      </div>

      <contactForm.Field name="email" children={(field) => (
        <FieldInput field={field} label="E-Mail" className="bg-white" />
      )} />
    </FormModal>
  );
}
