
import { useTranslation } from "react-i18next";
import useEmployeeForm from "../-hooks/use-employee-form";
import type { User } from '@keepit/schemas';
import { Button, Dialog, FieldInput, FieldPasswordInput } from "@/components";

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
        <Dialog
            defaultOpen
            onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}
        >
            <Dialog.Header title={currentEmployee ? t("employees.modal.editTitle") : t("employees.modal.createTitle")} />
            <Dialog.Body>
                <form id={formId} onSubmit={handleSubmit} className="grid gap-4">
                    <div className="flex items-center gap-4">
                        <form.Field name="salutation" children={(field) => (
                            <div className="flex-1 grid gap-2">
                                <FieldInput field={field} label={t("employees.modal.salutation")} size="sm" />
                            </div>
                        )} />

                        <form.Field name="firstName" children={(field) => (
                            <div className="flex-1 grid gap-2">
                                <FieldInput field={field} size="sm" label={t("employees.modal.firstName")} />
                            </div>
                        )} />

                        <form.Field name="lastName" children={(field) => (
                            <div className="flex-1 grid gap-2">
                                <FieldInput field={field} size="sm" label={t("employees.modal.lastName")} />
                            </div>
                        )} />
                    </div>

                    <div className="flex items-center gap-4">
                        <form.Field name="email" children={(field) => (
                            <div className="flex-1 grid gap-2">
                                <FieldInput field={field} label={t("employees.modal.email")} size="sm" />
                            </div>
                        )} />

                        <form.Field name="phone" children={(field) => (
                            <div className="flex-1 grid gap-2">
                                <FieldInput field={field} label={t("employees.modal.phone")} size="sm" />
                            </div>
                        )} />

                        <form.Field name="password" children={(field) => (
                            <div className="flex-1 grid gap-2">
                                <FieldPasswordInput field={field} size="sm" label={t("employees.modal.password")} showRequirements />
                            </div>
                        )} />
                    </div>
                </form>
            </Dialog.Body>
            <Dialog.Footer>
                <Dialog.Close render={<Button variant="border" size="sm">{t("button.cancel")}</Button>} />
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Button
                            type="submit"
                            form={formId}
                            size="sm"
                            disabled={!canSubmit}
                            loading={isSubmitting}
                        >
                            {t("button.save")}
                        </Button>
                    )}
                />
            </Dialog.Footer>
        </Dialog>
    );
}
