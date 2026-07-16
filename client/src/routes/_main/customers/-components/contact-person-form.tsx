import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import type { SyntheticEvent } from "react";

import type { ContactPerson, CreateCustomerContactInput, } from "@/types";
import { Button, Input, ModalDialog } from "@/components";
import { getFormError } from "@/lib/utils";

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

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    contactForm.handleSubmit();
  }

  const isEditing = Boolean(currentContactPerson);

  return (
    <ModalDialog onClose={cancelFn}>
      <ModalDialog.Header>
        <h1 className="text-lg">{isEditing ? "Kontaktperson bearbeiten" : "Kontaktperson hinzufügen"}</h1>
      </ModalDialog.Header>

      <ModalDialog.Content>
        <form id="contact-person-form" onSubmit={handleSubmit} className="grid gap-4">
          <div className="flex items-center gap-2">
            <contactForm.Field name="salutation" children={(field) => (
              <Input value={field.state.value} label="Anrede" className="bg-white"
                error={getFormError(field.state.meta.errors)}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur} />
            )} />

            <contactForm.Field name="firstName" children={(field) => (
              <Input value={field.state.value} label="Vorname" className="bg-white"
                error={getFormError(field.state.meta.errors)}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )} />

            <contactForm.Field name="lastName" children={(field) => (
              <Input value={field.state.value} label="Nachname" className="bg-white"
                error={getFormError(field.state.meta.errors)}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )} />
          </div>

          <contactForm.Field name="email" children={(field) => (
            <Input value={field.state.value || ''} label="E-Mail" className="bg-white"
              error={getFormError(field.state.meta.errors)}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          )} />
        </form>
      </ModalDialog.Content>

      <ModalDialog.Footer>
        <Button type="button" variant="secondary" size="sm" onClick={cancelFn}>
          Abbrechen
        </Button>
        <contactForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button form="contact-person-form" type="submit" size="sm" disabled={!canSubmit} loading={isSubmitting}>
              Speichern
            </Button>
          )} />
      </ModalDialog.Footer>
    </ModalDialog>
  );
}
