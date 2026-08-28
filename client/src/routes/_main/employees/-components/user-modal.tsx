
import useEmployeeForm from "../-hooks/use-employee-form";
import type { User } from '@keepit/schemas';
import { FieldInput, FormDialog } from "@/components";

interface Props {
    onClose: () => void;
    currentEmployee?: User | null;
}

export default function UserModal({ onClose, currentEmployee }: Props) {

    const { form, formId } = useEmployeeForm({
        currentEmployee, onClose,
    });

    return (
        <FormDialog
            form={form}
            defaultOpen
            onClose={onClose}
            formId={formId}
            title={currentEmployee ? "Angestellten bearbeiten" : "Neuen Angestellten anlegen"}
        >
            <>
                    <div className="flex items-center gap-4">
                        <form.Field name="salutation" children={(field) => (
                            <div className="flex-1 grid gap-2">
                                <FieldInput field={field} label="Anrede" size="sm" />
                            </div>
                        )} />

                        <form.Field name="firstName" children={(field) => (
                            <div className="flex-1 grid gap-2">
                                <FieldInput field={field} size="sm" label="Vorname" />
                            </div>
                        )} />

                        <form.Field name="lastName" children={(field) => (
                            <div className="flex-1 grid gap-2">
                                <FieldInput field={field} size="sm" label="Nachname" />
                            </div>
                        )} />
                    </div>

                    <div className="flex items-center gap-4">
                        <form.Field name="email" children={(field) => (
                            <div className="flex-1 grid gap-2">
                                <FieldInput field={field} label="E-Mail" size="sm" />
                            </div>
                        )} />

                        <form.Field name="phone" children={(field) => (
                            <div className="flex-1 grid gap-2">
                                <FieldInput field={field} label="Telefonnummer" size="sm" />
                            </div>
                        )} />

                        <form.Field name="password" children={(field) => (
                            <div className="flex-1 grid gap-2">
                                <FieldInput field={field} type="password" size="sm" label="Passwort" />
                            </div>
                        )} />
                    </div>
            </>
        </FormDialog>
    );
}
