import type React from "react";
import {useForm} from "@tanstack/react-form";
import {useQueryClient} from "@tanstack/react-query";
import {toast} from "react-toastify";
import {z} from "zod";

import {Button, Input} from "@/components";
import {useAuth} from "@/context/auth.tsx";
import {authClient} from "@/lib/auth-client.ts";
import {getFormError} from "@/lib/utils.ts";
import SettingsCard from "@/routes/_main/settings/-components/settings-card.tsx";

const emailSchema = z.object({
    newEmail: z.email("Ungültige E-Mail!"),
});

export default function EmailForm() {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    const emailForm = useForm({
        defaultValues: {
            newEmail: "",
        },
        validators: {
            onChange: emailSchema,
        },
        onSubmit: async ({value, formApi}) => {
            const {error} = await authClient.changeEmail({
                newEmail: value.newEmail,
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            await queryClient.invalidateQueries({queryKey: ["session"]});
            toast.success("E-Mail-Adresse geändert");
            formApi.reset();
        },
    });

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        emailForm.handleSubmit();
    };

    return (
        <SettingsCard title="E-Mail-Adresse ändern">
            <form onSubmit={handleSubmit} className="grid gap-4">
                <Input label="Aktuelle E-Mail" size="sm" value={user?.email ?? ""} disabled/>

                <emailForm.Field name="newEmail" children={(field) => (
                    <Input id={field.name} label="Neue E-Mail-Adresse" size="sm"
                           error={getFormError(field.state.meta.errors)}
                           value={field.state.value}
                           onChange={(e) => field.handleChange(e.target.value)}
                           onBlur={field.handleBlur}
                    />
                )}/>

                <div className="flex justify-end">
                    <emailForm.Subscribe
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
