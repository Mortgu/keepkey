import { z } from "zod";
import { useForm } from "@tanstack/react-form";

import type { ContactPerson, CreateCustomerContactInput, } from "@/types";
import { FieldInput, FormModal } from "@/components";

const contactPersonSchema = z.object({
  salutation: z.string().min(1, "Anrede fehlt"),
  firstName: z.string().min(1, "Vorname fehlt"),
  lastName: z.string().min(1, "Nachname fehlt"),
  email: z.email().nullable(),
});

interface Props {
  saveFn: (data: CreateCustomerContactInput) => void;
  cancelFn: () => void;

  currentCustomerId: string;
  currentContactPerson?: ContactPerson | null;
}

export default function ContactPersonForm({ saveFn, cancelFn, currentCustomerId, currentContactPerson }: Props) {
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
      saveFn({
        salutation: value.salutation,
        firstName: value.firstName,
        lastName: value.lastName,
        email: value.email || "",
        customerId: currentCustomerId,
      });
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
