import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import type { SyntheticEvent } from "react";
import type { TFunction } from "i18next";

import type { BindableField } from "@/components";
import type { TranslationKey } from "@/i18n";
import { Button, FieldPasswordInput, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, showToast } from "@/components";
import { authClient } from "@/lib/auth-client.ts";

/* Zod meldet Übersetzungsschlüssel; übersetzt wird erst bei der Anzeige, damit
   ein Sprachwechsel auch schon angezeigte Meldungen erfasst. */
const passwordSchema = z.object({
    currentPassword: z.string().min(1, "settings.validation.required" satisfies TranslationKey),
    newPassword: z.string()
        .min(PASSWORD_MIN_LENGTH, "settings.validation.passwordMin" satisfies TranslationKey)
        .max(PASSWORD_MAX_LENGTH, "settings.validation.passwordMax" satisfies TranslationKey),
    confirmPassword: z.string(),
}).refine((value) => value.newPassword === value.confirmPassword, {
    message: "settings.validation.passwordMismatch" satisfies TranslationKey,
    path: ["confirmPassword"],
});

/** Die Längengrenzen stehen nur hier — die gemeinsame Fehleranzeige kennt sie nicht. */
const ERROR_PARAMS: Partial<Record<TranslationKey, { count: number }>> = {
    "settings.validation.passwordMin": { count: PASSWORD_MIN_LENGTH },
    "settings.validation.passwordMax": { count: PASSWORD_MAX_LENGTH },
};

function isValidationKey(message: unknown): message is TranslationKey {
    return typeof message === "string" && message.startsWith("settings.validation.");
}

/**
 * Das Feld mit übersetzten Fehlermeldungen samt Längengrenzen. Die Feld-Anzeige
 * kann Schlüssel zwar auflösen, aber keine Parameter mitgeben — darum hier.
 */
function withTranslatedErrors<TValue>(field: BindableField<TValue>, t: TFunction): BindableField<TValue> {
    const errors = field.state.meta.errors.map((error) => {
        const message = (error as { message?: unknown } | undefined)?.message;
        return isValidationKey(message) ? { message: t(message, ERROR_PARAMS[message]) } : error;
    });

    return {
        name: field.name,
        state: { value: field.state.value, meta: { errors } },
        handleChange: (value) => field.handleChange(value),
        handleBlur: () => field.handleBlur(),
    };
}

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
                    <FieldPasswordInput field={withTranslatedErrors(field, t)} label={t("settings.password.current")} size="sm"
                        autoComplete="current-password" />
                )} />

                <passwordForm.Field name="newPassword" children={(field) => (
                    <FieldPasswordInput field={withTranslatedErrors(field, t)} label={t("settings.password.new")} size="sm" showRequirements
                        autoComplete="new-password" />
                )} />

                <passwordForm.Field name="confirmPassword" children={(field) => (
                    <FieldPasswordInput field={withTranslatedErrors(field, t)} label={t("settings.password.confirm")} size="sm"
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
