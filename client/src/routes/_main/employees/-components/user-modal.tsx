
import type { User } from '@keepit/schemas';
import { Button, FieldInput, ModalDialog } from "@/components";
import useEmployeeForm from "../-hooks/use-employee-form";
import { useTranslation } from 'react-i18next';

interface Props {
    onClose: () => void;
    currentEmployee?: User | null;
}

export default function UserModal({ onClose, currentEmployee }: Props) {
    const { t } = useTranslation();

    const { form, formId, handleSubmit } = useEmployeeForm({
        currentEmployee, onClose,
    });

    return (
        <ModalDialog onClose={onClose}>
            <ModalDialog.Header>
                <h1 className="text-lg">
                    {currentEmployee && "Angestellten bearbeiten"}
                    {!currentEmployee && "Neuen Angestellten anlegen"}
                </h1>
            </ModalDialog.Header>
            <ModalDialog.Content>
                <form id={formId} onSubmit={handleSubmit} className='grid gap-4'>
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
                </form>
            </ModalDialog.Content>
            <ModalDialog.Footer>
                <Button onClick={onClose} type="button" size="sm" variant="border">
                    {t("button.cancel")}
                </Button>
                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                    <Button type="submit" form={formId} size="sm" disabled={!canSubmit} loading={isSubmitting}>
                        {t("button.save")}
                    </Button>
                )} />
            </ModalDialog.Footer>
        </ModalDialog>
    );
}
