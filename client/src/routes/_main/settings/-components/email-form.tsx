import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import type { SyntheticEvent } from "react";

import { Button, FieldInput, Input, showToast } from "@/components";
import { useAuth } from "@/context/auth-context";
import { userKeys } from "@/hooks/users/user-keys";
import { authClient } from "@/lib/auth-client.ts";

export default function EmailForm() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const emailSchema = z.object({
        newEmail: z.email(t("validation.email")),
    });

    const emailForm = useForm({
        defaultValues: {
            newEmail: "",
        },
        validators: {
            onChange: emailSchema,
        },
        onSubmit: async ({ value, formApi }) => {
            const { error } = await authClient.changeEmail({
                newEmail: value.newEmail,
            });

            if (error) {
                showToast.error("common.errorGeneric", { message: error.message });
                return;
            }

            await queryClient.invalidateQueries({ queryKey: userKeys.session() });
            showToast.success("settings.toast.emailChanged");
            formApi.reset();
        },
    });

    const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        emailForm.handleSubmit();
    };

    return (
        <div className="grid gap-4 bg-(--page-bg) p-4 rounded-md border border-(--border) overflow-hidden">
            <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="flex items-center justify-center gap-4">
                    <Input label={t("settings.email.current")} size="sm" value={user?.email ?? ""} disabled />

                    <emailForm.Field name="newEmail" children={(field) => (
                        <FieldInput field={field} label={t("settings.email.new")} size="sm" />
                    )} />
                </div>

                <div className="flex justify-end">
                    <emailForm.Subscribe
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
