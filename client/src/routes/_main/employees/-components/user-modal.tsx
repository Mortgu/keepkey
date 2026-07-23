import { z } from "zod";
import { useForm } from "@tanstack/react-form";

import type { User } from "@/types";
import { useUserManager } from "@/hooks";
import { FieldInput, FormModal } from "@/components";

interface UserModalProps {
    onClose: () => void;
    currentUser: User | null;
}

const createUserSchema = z.object({
    salutation: z.string().min(1, "Pflichtfeld"),
    firstName: z.string().min(1, "Pflichtfeld"),
    lastName: z.string().min(1, "Pflichtfeld"),
    email: z.string().email("Ungültige E-Mail"),
    phone: z.string().min(1, "Ungültige Telefonnummer"),
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
    phone: "",
    password: "",
};

export default function UserModal({ onClose, currentUser }: UserModalProps) {
    const isEdit = currentUser !== null;

    const { updateUser, createUser } = useUserManager();

    const userForm = useForm({
        defaultValues: currentUser ? {
            salutation: currentUser.salutation,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            email: currentUser.email,
            phone: currentUser.phone,
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
                await createUser({ ...value, name });
            }
            onClose();
        },
    });

    return (
        <FormModal
            form={userForm}
            onClose={onClose}
            title={<h1 className="text-lg">{isEdit ? "Nutzer bearbeiten" : "Neuen Nutzer anlegen"}</h1>}
            formId="user-form"
            size="xs"
        >
            <div className="flex items-center gap-4">
                <userForm.Field name="salutation" children={(field) => (
                    <div className="flex-1 grid gap-2">
                        <FieldInput field={field} label="Anrede" size="sm" />
                    </div>
                )} />

                <userForm.Field name="firstName" children={(field) => (
                    <div className="flex-1 grid gap-2">
                        <FieldInput field={field} size="sm" label="Vorname" />
                    </div>
                )} />

                <userForm.Field name="lastName" children={(field) => (
                    <div className="flex-1 grid gap-2">
                        <FieldInput field={field} size="sm" label="Nachname" />
                    </div>
                )} />
            </div>

            <div className="flex items-center gap-4">
                <userForm.Field name="email" children={(field) => (
                    <div className="flex-1 grid gap-2">
                        <FieldInput field={field} label="E-Mail" size="sm" />
                    </div>
                )} />

                <userForm.Field name="phone" children={(field) => (
                    <div className="flex-1 grid gap-2">
                        <FieldInput field={field} label="Telefonnummer" size="sm" />
                    </div>
                )} />

                <userForm.Field name="password" children={(field) => (
                    <div className="flex-1 grid gap-2">
                        <FieldInput field={field} type="password" size="sm" label="Passwort" />
                    </div>
                )} />
            </div>
        </FormModal>
    );
}
