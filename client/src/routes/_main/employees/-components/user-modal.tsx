import { useForm } from "@tanstack/react-form";

import {
    
    createUserSchema
} from '@keepit/schemas';
import type {User} from '@keepit/schemas';
import { useUserManager } from "@/hooks";
import { FieldInput, FormModal } from "@/components";


interface UserModalProps {
    onClose: () => void;
    currentUser: User | null;
}

const emptyUser = {
    firstName: "",
    lastName: "",
    salutation: "",
    email: "",
    phone: "",
    password: "",
};

export default function UserModal({ onClose, currentUser }: UserModalProps) {
    const isEdit = currentUser !== null;

    const { updateUser, createUser } = useUserManager();

    const userForm = useForm({
        defaultValues: isEdit ? {
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            salutation: currentUser.salutation,
            email: currentUser.email,
            phone: currentUser.phone ?? "",
            password: "",
        } : emptyUser,
        validators: {
            onChange: createUserSchema,
            onMount: createUserSchema,
        },
        onSubmit: async ({ value }) => {
            if (isEdit) {
                updateUser({ id: currentUser.id, body: value });
            } else {
                await createUser({ ...value });
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
