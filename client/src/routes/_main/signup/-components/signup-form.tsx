import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { authClient } from "@/lib/auth-client.ts";

import { z } from 'zod';
import Input from "@/components/inputs/input.tsx";
import Button from "@/components/button/button.tsx";
import Checkbox from "@/components/inputs/checkbox.tsx";

const signupSchema = z.object({
    salutation: z.string().min(1, "Anrede erforderlich"),
    firstName: z.string().min(2, "Vorname zu kurz"),
    lastName: z.string().min(2, "Nachname zu kurz"),
    userEmail: z.string().email("Ungültige E-Mail"),
    invoiceEmail: z.string().email("Ungültige E-Mail"),
    password: z.string().min(8, "Passwort muss mind. 8 Zeichen haben"),
});

export function SignupFormComponent() {
    const [error, setError] = useState<string | undefined>(undefined);
    const [isSameEmail, setIsSameEmail] = useState(true);

    const form = useForm({
        defaultValues: {
            salutation: '',
            firstName: '',
            lastName: '',
            userEmail: '',
            invoiceEmail: '',
            password: '',
        },
        validators: {
            onChange: signupSchema,
        },
        onSubmit: async ({ value }) => {
            setError(undefined);

            const fullName = `${value.firstName} ${value.lastName}`.trim();

            const { data, error: authError } = await authClient.signUp.email({
                email: value.userEmail,
                password: value.password,
                name: fullName,
                salutation: value.salutation,
                firstName: value.firstName,
                lastName: value.lastName,
            });

            if (authError) {
                return setError(authError.message);
            }

            window.location.assign('/');

            return data;
        }
    });

    return (
        <div className='w-full max-w-3xl mx-auto p-4'>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
                className='grid gap-6'
            >
                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
                        {error}
                    </div>
                )}

                <div className='grid gap-6'>

                    <div className='flex flex-wrap gap-4'>
                        <form.Field name='salutation'>
                            {(field) => (
                                <div className='flex-1 min-w-[120px] grid gap-2'>
                                    <div className="grid text-sm font-medium ">
                                        {field.state.meta.errors.length <= 0 && (
                                            <label>Anrede</label>
                                        )}

                                        {field.state.meta.errors.length > 0 && (
                                            <span className="text-red-500">
                                                {field.state.meta.errors.map(err => typeof err === 'object' ? err.message : err).join(', ')}
                                            </span>
                                        )}
                                    </div>
                                    <select
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value=''>Bitte wählen</option>
                                        <option value='Herr'>Herr</option>
                                        <option value='Frau'>Frau</option>
                                        <option value='Divers'>Divers</option>
                                    </select>


                                </div>
                            )}
                        </form.Field>

                        <form.Field name="firstName">
                            {(field) => (
                                <div className='flex-[2] min-w-[150px] grid gap-2'>
                                    <label className="text-sm font-medium">Vorname</label>
                                    <Input
                                        id={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                </div>
                            )}
                        </form.Field>

                        <form.Field name="lastName">
                            {(field) => (
                                <div className='flex-[2] min-w-[150px] grid gap-2'>
                                    <label className="text-sm font-medium">Nachname</label>
                                    <Input
                                        id={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                </div>
                            )}
                        </form.Field>
                    </div>

                    {/* Zeile 2: Emails */}
                    <div className='grid md:grid-cols-2 gap-4'>
                        <form.Field name="userEmail">
                            {(field) => (
                                <div className='grid gap-2'>
                                    <label className="text-sm font-medium">Konto E-Mail</label>
                                    <Input
                                        id={field.name}
                                        type="email"
                                        value={field.state.value}
                                        onChange={(e) => {
                                            field.handleChange(e.target.value);
                                            if (isSameEmail) form.setFieldValue('invoiceEmail', e.target.value);
                                        }}
                                    />
                                </div>
                            )}
                        </form.Field>

                        <form.Field name="invoiceEmail">
                            {(field) => (
                                <div className='grid gap-2'>
                                    <div className='flex items-center justify-between'>
                                        <label className="text-sm font-medium">Rechnungs-E-Mail</label>
                                        <div className='flex items-center gap-2'>
                                            <span className="text-xs text-gray-500">Gleiche?</span>
                                            <Checkbox
                                                checked={isSameEmail}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setIsSameEmail(checked);
                                                    if (checked) {
                                                        form.setFieldValue('invoiceEmail', form.getFieldValue('userEmail'));
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <Input
                                        id={field.name}
                                        disabled={isSameEmail}
                                        type="email"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                </div>
                            )}
                        </form.Field>
                    </div>

                    <form.Field name="password">
                        {(field) => (
                            <div className='grid gap-2'>
                                <label className="text-sm font-medium">Passwort</label>
                                <Input
                                    id={field.name}
                                    type="password"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Subscribe
                        selector={(state) => [state.canSubmit, state.isSubmitting]}
                        children={([canSubmit, isSubmitting]) => (
                            <Button loading={isSubmitting} type="submit" disabled={!canSubmit} className="w-full">
                                Registrieren
                            </Button>
                        )}
                    />
                </div>
            </form>
        </div>
    );
}