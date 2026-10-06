import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import type { SyntheticEvent } from "react";

import { Button, FieldInput, showToast } from "@/components";
import { useAuth } from "@/context/auth-context";
import { userKeys } from "@/hooks/users/user-keys";
import { authClient } from "@/lib/auth-client.ts";

export default function ProfileForm() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const profileSchema = z.object({
        salutation: z.string().min(1, t("validation.required")),
        firstName: z.string().min(1, t("validation.required")),
        lastName: z.string().min(1, t("validation.required")),
        phone: z.string(),
    });

    const profileForm = useForm({
        defaultValues: {
            salutation: user?.salutation ?? "",
            firstName: user?.firstName ?? "",
            lastName: user?.lastName ?? "",
            phone: user?.phone ?? "",
        },
        validators: {
            onChange: profileSchema,
        },
        onSubmit: async ({ value }) => {
            const { error } = await authClient.updateUser({
                name: `${value.firstName} ${value.lastName}`,
                salutation: value.salutation,
                firstName: value.firstName,
                lastName: value.lastName,
                phone: value.phone || undefined,
            });

            if (error) {
                showToast.error("common.errorGeneric", { message: error.message });
                return;
            }

            await queryClient.invalidateQueries({ queryKey: userKeys.session() });
            showToast.success("settings.toast.profileSaved");
        },
    });

    const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        profileForm.handleSubmit();
    };

    return (
        <div className="grid gap-4 bg-(--page-bg) p-4 rounded-md border border-(--border) overflow-hidden">

            <form id="profile-form" onSubmit={handleSubmit} className="grid gap-4">
                <div className="flex items-center gap-4">
                    <profileForm.Field name="salutation" children={(field) => (
                        <div className="flex-1 grid gap-2">
                            <FieldInput field={field} label={t("settings.profile.salutation")} size="sm" />
                        </div>
                    )} />

                    <profileForm.Field name="firstName" children={(field) => (
                        <div className="flex-2 grid gap-2">
                            <FieldInput field={field} label={t("settings.profile.firstName")} size="sm" />
                        </div>
                    )} />

                    <profileForm.Field name="lastName" children={(field) => (
                        <div className="flex-2 grid gap-2">
                            <FieldInput field={field} label={t("settings.profile.lastName")} size="sm" />
                        </div>
                    )} />

                    <profileForm.Field name="phone" children={(field) => (
                        <div className="flex-2 grid gap-2">
                            <FieldInput field={field} label={t("settings.profile.phone")} size="sm" />
                        </div>
                    )} />
                </div>
            </form>

            <div className="flex justify-end">
                <profileForm.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Button form="profile-form" size="xs" disabled={!canSubmit} loading={isSubmitting}>
                            {t("button.save")}
                        </Button>
                    )}
                />
            </div>
        </div>
    )
}
