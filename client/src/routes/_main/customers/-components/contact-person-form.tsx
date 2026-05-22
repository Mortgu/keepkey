import { type SyntheticEvent } from "react";
import { z } from "zod";

import { Button, Input } from "@/components";
import type { ContactPerson, CreateContactPersonInput } from "@/types";
import { useForm } from "@tanstack/react-form";

const contactPersonSchema = z.object({
  salutation: z.string().min(1, "Anrede fehlt"),
  firstName: z.string().min(1, "Vorname fehlt"),
  lastName: z.string().min(1, "Nachname fehlt"),
  email: z.email().nullable(),
});

interface Props {
  saveFn: (data: CreateContactPersonInput) => void;
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

  return (
    <div className="bg-(--subtle-50) w-full grid gap-3 border border-(--border) p-3 rounded-md">
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="flex items-center gap-2">
          <contactForm.Field name="salutation" children={(field) => (
            <Input value={field.state.value} label="Anrede" className="bg-white"
              error={field.state.meta.errors[0]?.message}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur} />
          )} />

          <contactForm.Field name="firstName" children={(field) => (
            <Input value={field.state.value} label="Vorname" className="bg-white"
              error={field.state.meta.errors[0]?.message}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          )} />

          <contactForm.Field name="lastName" children={(field) => (
            <Input value={field.state.value} label="Nachname" className="bg-white"
              error={field.state.meta.errors[0]?.message}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          )} />
        </div>

        <div className="flex gap-2">
          <contactForm.Field name="email" children={(field) => (
            <Input value={field?.state?.value || ''} label="E-Mail" className="bg-white"
              error={field.state.meta.errors[0]?.message}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          )} />

          <div className="flex gap-2 mt-auto">
            <Button type="button" variant="secondary" size="sm" onClick={cancelFn}>
              Abbrechen
            </Button>

            <contactForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" size="sm" disabled={!canSubmit} loading={isSubmitting}>
                  Speichern
                </Button>
              )} />
          </div>
        </div>
      </form>

      <div className="w-fit flex items-center gap-2 ml-auto">

      </div>
    </div>
  );
}
