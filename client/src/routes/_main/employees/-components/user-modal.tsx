import type React from "react";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";

import { useUserHook } from "@/hooks";
import { type User } from "@/types";
import { Input, ModalDialog, Button } from "@/components";

interface UserModalProps {
  onClose: () => void;
  currentUser: User | null;
}

const createUserSchema = z.object({
  salutation: z.string().min(1, "Pflichtfeld"),
  firstName: z.string().min(1, "Pflichtfeld"),
  lastName: z.string().min(1, "Pflichtfeld"),
  email: z.email("Ungültige E-Mail"),
  password: z.string().min(8, "Pflichtfeld (8)"),
});

const editUserSchema = createUserSchema.extend({
  password: z.string().refine((val) => val === "" || val.length >= 8, "Mind. 8 Zeichen"),
});

const emptyUser = {
  salutation: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

export default function UserModal({ onClose, currentUser }: UserModalProps) {
  const isEdit = currentUser !== null;

  const { updateUser, createUser } = useUserHook();

  const userForm = useForm({
    defaultValues: currentUser ? {
      salutation: currentUser.salutation ?? "",
      firstName: currentUser.firstName ?? "",
      lastName: currentUser.lastName ?? "",
      email: currentUser.email ?? "",
      password: "",
    } : emptyUser,
    validators: {
      onChange: isEdit ? editUserSchema : createUserSchema,
      onMount: isEdit ? editUserSchema : createUserSchema,
    },
    onSubmit: async ({ value }) => {
      const name = `${value.firstName} ${value.lastName}`;
      if (isEdit) {
        updateUser({ id: currentUser.id, body: { ...value, name } });
      } else {
        await createUser({ body: { ...value, name } });
      }
      onClose();
    },
  });

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    userForm.handleSubmit();
  };

  return (
    <ModalDialog onClose={onClose}>
      <ModalDialog.Header>
        <h1 className="text-lg">
          {isEdit ? "Nutzer bearbeiten" : "Neuen Nutzer anlegen"}
        </h1>
      </ModalDialog.Header>

      <ModalDialog.Content>
        <form id="user-form" onSubmit={handleSubmit} className="grid gap-4">
          <div className="flex items-center gap-4">
            <userForm.Field name="salutation" children={(field) => (
              <div className="flex-1 grid gap-2">
                <Input id={field.name} label="Anrede" input_size="sm"
                  error={field.state.meta.errors[0]?.message}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </div>
            )} />

            <userForm.Field name="firstName" children={(field) => (
              <div className="flex-1 grid gap-2">
                <Input id={field.name} input_size="sm" label="Vorname"
                  error={field.state.meta.errors[0]?.message}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </div>
            )} />

            <userForm.Field name="lastName" children={(field) => (
              <div className="flex-1 grid gap-2">
                <Input id={field.name} input_size="sm" label="Nachname"
                  error={field.state.meta.errors[0]?.message}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </div>
            )} />
          </div>

          <div className="flex items-center gap-4">
            <userForm.Field name="email" children={(field) => (
              <div className="flex-1 grid gap-2">
                <Input id={field.name} label="E-Mail" input_size="sm"
                  error={field.state.meta.errors[0]?.message}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </div>
            )} />

            <userForm.Field name="password" children={(field) => (
              <div className="flex-1 grid gap-2">
                <Input id={field.name} type="password" input_size="sm" label="Passwort"
                  error={field.state.meta.errors[0]?.message}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </div>
            )} />
          </div>
        </form>
      </ModalDialog.Content>

      <ModalDialog.Footer>
        <Button variant="secondary" size="xs" onClick={onClose}>
          Abbrechen
        </Button>
        <userForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
          <Button form="user-form" size="xs" disabled={!canSubmit} loading={isSubmitting}>
            Speichern
          </Button>
        )} />
      </ModalDialog.Footer>
    </ModalDialog>
  );
}
