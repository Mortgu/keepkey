import type React from "react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { z } from "zod";

import { Button, Input } from "@/components";
import { useAuth } from "@/context/auth.tsx";
import { authClient } from "@/lib/auth-client.ts";
import { getFormError } from "@/lib/utils.ts";

const profileSchema = z.object({
    salutation: z.string().min(1, "Pflichtfeld"),
    firstName: z.string().min(1, "Pflichtfeld"),
    lastName: z.string().min(1, "Pflichtfeld"),
    phone: z.string(),
});

export default function ProfileForm() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

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
                toast.error(error.message);
                return;
            }

            await queryClient.invalidateQueries({ queryKey: ["session"] });
            toast.success("Profil gespeichert");
        },
    });

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
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
                            <Input id={field.name} label="Anrede" size="sm"
                                error={getFormError(field.state.meta.errors)}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                            />
                        </div>
                    )} />

                    <profileForm.Field name="firstName" children={(field) => (
                        <div className="flex-2 grid gap-2">
                            <Input id={field.name} label="Vorname" size="sm"
                                error={getFormError(field.state.meta.errors)}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                            />
                        </div>
                    )} />

                    <profileForm.Field name="lastName" children={(field) => (
                        <div className="flex-2 grid gap-2">
                            <Input id={field.name} label="Nachname" size="sm"
                                error={getFormError(field.state.meta.errors)}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                            />
                        </div>
                    )} />

                    <profileForm.Field name="phone" children={(field) => (
                        <div className="flex-2 grid gap-2">
                            <Input id={field.name} label="Telefonnummer" size="sm"
                                error={getFormError(field.state.meta.errors)}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                            />
                        </div>
                    )} />
                </div>
            </form>

            <div className="flex justify-end">
                <profileForm.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Button form="profile-form" size="xs" disabled={!canSubmit} loading={isSubmitting}>
                            Speichern
                        </Button>
                    )}
                />
            </div>
        </div>
    )
}
