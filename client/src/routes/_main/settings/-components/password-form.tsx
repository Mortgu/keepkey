import { useForm } from "@tanstack/react-form";
import { toast } from "react-toastify";
import { z } from "zod";
import type { SyntheticEvent } from "react";

import { Button, FieldInput } from "@/components";
import { authClient } from "@/lib/auth-client.ts";
import { useTranslation } from "react-i18next";

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Pflichtfeld"),
    newPassword: z.string().min(8, "min. 8 Zeichen!"),
    confirmPassword: z.string(),
}).refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwörter stimmen nicht überein!",
    path: ["confirmPassword"],
});

export default function PasswordForm() {
    const { t } = useTranslation();
    const passwordForm = useForm({
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
        validators: {
            onChange: passwordSchema,
        },
        onSubmit: async ({ value, formApi }) => {
            const { error } = await authClient.changePassword({
                currentPassword: value.currentPassword,
                newPassword: value.newPassword,
                revokeOtherSessions: true,
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            toast.success("Passwort geändert");
            formApi.reset();
        },
    });

    const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        passwordForm.handleSubmit();
    };

    return (
        <div className="grid gap-4 bg-(--page-bg) p-4 rounded-md border border-(--border) overflow-hidden">
            <form onSubmit={handleSubmit} className="grid gap-4">
                <passwordForm.Field name="currentPassword" children={(field) => (
                    <FieldInput field={field} label="Aktuelles Passwort" size="sm" type="password"
                        autoComplete="current-password" />
                )} />

                <passwordForm.Field name="newPassword" children={(field) => (
                    <FieldInput field={field} label="Neues Passwort" size="sm" type="password"
                        autoComplete="new-password" />
                )} />

                <passwordForm.Field name="confirmPassword" children={(field) => (
                    <FieldInput field={field} label="Neues Passwort wiederholen" size="sm" type="password"
                        autoComplete="new-password" />
                )} />

                <div className="flex justify-end">
                    <passwordForm.Subscribe
                        selector={(state) => [state.canSubmit, state.isSubmitting]}
                        children={([canSubmit, isSubmitting]) => (
                            <Button size="xs" disabled={!canSubmit} loading={isSubmitting}>
                                {t("button.save")}
                            </Button>
                        )}
                    />
                </div>
            </form>
        </div>
    )
}
