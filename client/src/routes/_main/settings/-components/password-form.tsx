import type React from "react";
import {useForm} from "@tanstack/react-form";
import {toast} from "react-toastify";
import {z} from "zod";

import {Button, Input} from "@/components";
import {authClient} from "@/lib/auth-client.ts";
import {getFormError} from "@/lib/utils.ts";
import SettingsCard from "@/routes/_main/settings/-components/settings-card.tsx";

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Pflichtfeld"),
    newPassword: z.string().min(8, "min. 8 Zeichen!"),
    confirmPassword: z.string(),
}).refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwörter stimmen nicht überein!",
    path: ["confirmPassword"],
});

export default function PasswordForm() {
    const passwordForm = useForm({
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
        validators: {
            onChange: passwordSchema,
        },
        onSubmit: async ({value, formApi}) => {
            const {error} = await authClient.changePassword({
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

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        passwordForm.handleSubmit();
    };

    return (
        <SettingsCard title="Passwort ändern">
            <form onSubmit={handleSubmit} className="grid gap-4">
                <passwordForm.Field name="currentPassword" children={(field) => (
                    <Input id={field.name} label="Aktuelles Passwort" size="sm" type="password"
                           autoComplete="current-password"
                           error={getFormError(field.state.meta.errors)}
                           value={field.state.value}
                           onChange={(e) => field.handleChange(e.target.value)}
                           onBlur={field.handleBlur}
                    />
                )}/>

                <passwordForm.Field name="newPassword" children={(field) => (
                    <Input id={field.name} label="Neues Passwort" size="sm" type="password"
                           autoComplete="new-password"
                           error={getFormError(field.state.meta.errors)}
                           value={field.state.value}
                           onChange={(e) => field.handleChange(e.target.value)}
                           onBlur={field.handleBlur}
                    />
                )}/>

                <passwordForm.Field name="confirmPassword" children={(field) => (
                    <Input id={field.name} label="Neues Passwort wiederholen" size="sm" type="password"
                           autoComplete="new-password"
                           error={getFormError(field.state.meta.errors)}
                           value={field.state.value}
                           onChange={(e) => field.handleChange(e.target.value)}
                           onBlur={field.handleBlur}
                    />
                )}/>

                <div className="flex justify-end">
                    <passwordForm.Subscribe
                        selector={(state) => [state.canSubmit, state.isSubmitting]}
                        children={([canSubmit, isSubmitting]) => (
                            <Button size="sm" disabled={!canSubmit} loading={isSubmitting}>
                                Speichern
                            </Button>
                        )}
                    />
                </div>
            </form>
        </SettingsCard>
    )
}
