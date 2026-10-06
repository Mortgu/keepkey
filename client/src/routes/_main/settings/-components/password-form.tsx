import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import type { SyntheticEvent } from "react";

import { Button, FieldPasswordInput, showToast } from "@/components";
import { authClient } from "@/lib/auth-client.ts";

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;

export default function PasswordForm() {
    const { t } = useTranslation();

    const passwordSchema = z.object({
        currentPassword: z.string().min(1, t("validation.required")),
        newPassword: z.string()
            .min(PASSWORD_MIN, t("validation.passwordMin", { count: PASSWORD_MIN }))
            .max(PASSWORD_MAX, t("validation.passwordMax", { count: PASSWORD_MAX })),
        confirmPassword: z.string(),
    }).refine((value) => value.newPassword === value.confirmPassword, {
        message: t("validation.passwordMismatch"),
        path: ["confirmPassword"],
    });
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
                showToast.error("common.errorGeneric", { message: error.message });
                return;
            }

            showToast.success("settings.toast.passwordChanged");
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
                    <FieldPasswordInput field={field} label={t("settings.password.current")} size="sm"
                        autoComplete="current-password" />
                )} />

                <passwordForm.Field name="newPassword" children={(field) => (
                    <FieldPasswordInput field={field} label={t("settings.password.new")} size="sm" showRequirements
                        autoComplete="new-password" />
                )} />

                <passwordForm.Field name="confirmPassword" children={(field) => (
                    <FieldPasswordInput field={field} label={t("settings.password.confirm")} size="sm"
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
