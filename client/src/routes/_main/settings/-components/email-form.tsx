import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { z } from "zod";
import type { SyntheticEvent } from "react";

import { Button, FieldInput, Input } from "@/components";
import { useAuth } from "@/context/auth.tsx";
import { authClient } from "@/lib/auth-client.ts";
import { useTranslation } from "react-i18next";

const emailSchema = z.object({
    newEmail: z.email("Ungültige E-Mail!"),
});

export default function EmailForm() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const queryClient = useQueryClient();

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
                toast.error(error.message);
                return;
            }

            await queryClient.invalidateQueries({ queryKey: ["session"] });
            toast.success("E-Mail-Adresse geändert");
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
                    <Input label="Aktuelle E-Mail" size="sm" value={user?.email ?? ""} disabled />

                    <emailForm.Field name="newEmail" children={(field) => (
                        <FieldInput field={field} label="Neue E-Mail-Adresse" size="sm" />
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
