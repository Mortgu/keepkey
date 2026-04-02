import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { authClient } from "@/lib/auth-client.ts";
import { upsertAddress, createContactPersons } from "@/data/user.ts";

import { z } from 'zod';
import Input from "@/components/inputs/input.tsx";
import Button from "@/components/button/button.tsx";
import Checkbox from "@/components/inputs/checkbox.tsx";

type ContactPersonInput = { salutation: string; firstName: string; lastName: string; email?: string };

const signupSchema = z.object({
    salutation: z.string().min(1, "Anrede erforderlich"),
    firstName: z.string().min(2, "Vorname zu kurz"),
    lastName: z.string().min(2, "Nachname zu kurz"),
    userEmail: z.string().email("Ungültige E-Mail"),
    invoiceEmail: z.string().email("Ungültige E-Mail"),
    password: z.string().min(8, "Passwort muss mind. 8 Zeichen haben"),
    street: z.string().min(1, "Straße erforderlich"),
    plz: z.string().min(4, "PLZ erforderlich"),
    city: z.string().min(1, "Stadt erforderlich"),
});

export function SignupFormComponent() {
    const [error, setError] = useState<string | undefined>(undefined);
    const [isSameEmail, setIsSameEmail] = useState(true);
    const [sameContact, setSameContact] = useState(true);
    const [contactPersons, setContactPersons] = useState<ContactPersonInput[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        defaultValues: {
            salutation: '',
            firstName: '',
            lastName: '',
            userEmail: '',
            invoiceEmail: '',
            password: '',
            street: '',
            plz: '',
            city: '',
        },
        validators: {
            onChange: signupSchema,
        },
        onSubmit: async ({ value }) => {
            setError(undefined);
            setIsSubmitting(true);

            try {
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
                    setIsSubmitting(false);
                    return setError(authError.message);
                }

                // Save address
                await upsertAddress({
                    street: value.street,
                    plz: value.plz,
                    city: value.city,
                });

                // Save contact persons
                const persons = sameContact
                    ? [{ salutation: value.salutation, firstName: value.firstName, lastName: value.lastName, email: value.invoiceEmail }]
                    : contactPersons;

                if (persons.length > 0) {
                    await createContactPersons(persons);
                }

                window.location.assign('/');
                return data;
            } catch (err) {
                setIsSubmitting(false);
                setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
            }
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

                    {/* Zeile 3: Adresse */}
                    <div className='flex flex-wrap gap-4'>
                        <form.Field name="street">
                            {(field) => (
                                <div className='flex-[2] min-w-[150px] grid gap-2'>
                                    <label className="text-sm font-medium">Straße</label>
                                    <Input
                                        id={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                    {field.state.meta.errors.length > 0 && (
                                        <span className="text-red-500 text-sm">
                                            {field.state.meta.errors.map(err => typeof err === 'object' ? err.message : err).join(', ')}
                                        </span>
                                    )}
                                </div>
                            )}
                        </form.Field>

                        <form.Field name="plz">
                            {(field) => (
                                <div className='flex-1 min-w-[100px] grid gap-2'>
                                    <label className="text-sm font-medium">PLZ</label>
                                    <Input
                                        id={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                    {field.state.meta.errors.length > 0 && (
                                        <span className="text-red-500 text-sm">
                                            {field.state.meta.errors.map(err => typeof err === 'object' ? err.message : err).join(', ')}
                                        </span>
                                    )}
                                </div>
                            )}
                        </form.Field>

                        <form.Field name="city">
                            {(field) => (
                                <div className='flex-[2] min-w-[150px] grid gap-2'>
                                    <label className="text-sm font-medium">Stadt</label>
                                    <Input
                                        id={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                    {field.state.meta.errors.length > 0 && (
                                        <span className="text-red-500 text-sm">
                                            {field.state.meta.errors.map(err => typeof err === 'object' ? err.message : err).join(', ')}
                                        </span>
                                    )}
                                </div>
                            )}
                        </form.Field>
                    </div>

                    {/* Zeile 4: Kontaktperson */}
                    <div className='border-t pt-6'>
                        <div className='flex items-center justify-between mb-4'>
                            <label className="text-sm font-medium">Kontaktperson</label>
                            <div className='flex items-center gap-2'>
                                <span className="text-xs text-gray-500">Gleich wie Kontoinhaber?</span>
                                <Checkbox
                                    checked={sameContact}
                                    onChange={(e) => {
                                        setSameContact(e.target.checked);
                                        if (e.target.checked) {
                                            setContactPersons([]);
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {!sameContact && (
                            <div className='space-y-4'>
                                {contactPersons.length === 0 ? (
                                    <button
                                        type="button"
                                        onClick={() => setContactPersons([{ salutation: '', firstName: '', lastName: '', email: '' }])}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        + Kontaktperson hinzufügen
                                    </button>
                                ) : (
                                    <>
                                        {contactPersons.map((person, idx) => (
                                            <div key={idx} className='p-4 bg-gray-50 rounded-md space-y-3'>
                                                <div className='flex justify-between items-center'>
                                                    <span className="text-xs font-medium text-gray-600">Kontaktperson {idx + 1}</span>
                                                    {contactPersons.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setContactPersons(contactPersons.filter((_, i) => i !== idx))}
                                                            className="text-xs text-red-600 hover:underline"
                                                        >
                                                            Entfernen
                                                        </button>
                                                    )}
                                                </div>

                                                <div className='flex flex-wrap gap-4'>
                                                    <div className='flex-1 min-w-[120px] grid gap-2'>
                                                        <label className="text-sm font-medium">Anrede</label>
                                                        <select
                                                            value={person.salutation}
                                                            onChange={(e) => {
                                                                const updated = [...contactPersons];
                                                                updated[idx].salutation = e.target.value;
                                                                setContactPersons(updated);
                                                            }}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                                        >
                                                            <option value=''>Bitte wählen</option>
                                                            <option value='Herr'>Herr</option>
                                                            <option value='Frau'>Frau</option>
                                                            <option value='Divers'>Divers</option>
                                                        </select>
                                                    </div>

                                                    <div className='flex-[2] min-w-[150px] grid gap-2'>
                                                        <label className="text-sm font-medium">Vorname</label>
                                                        <Input
                                                            value={person.firstName}
                                                            onChange={(e) => {
                                                                const updated = [...contactPersons];
                                                                updated[idx].firstName = e.target.value;
                                                                setContactPersons(updated);
                                                            }}
                                                        />
                                                    </div>

                                                    <div className='flex-[2] min-w-[150px] grid gap-2'>
                                                        <label className="text-sm font-medium">Nachname</label>
                                                        <Input
                                                            value={person.lastName}
                                                            onChange={(e) => {
                                                                const updated = [...contactPersons];
                                                                updated[idx].lastName = e.target.value;
                                                                setContactPersons(updated);
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className='grid gap-2'>
                                                    <label className="text-sm font-medium">E-Mail (optional)</label>
                                                    <Input
                                                        type="email"
                                                        value={person.email || ''}
                                                        onChange={(e) => {
                                                            const updated = [...contactPersons];
                                                            updated[idx].email = e.target.value;
                                                            setContactPersons(updated);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                        {contactPersons.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setContactPersons([...contactPersons, { salutation: '', firstName: '', lastName: '', email: '' }])}
                                                className="text-sm text-blue-600 hover:underline mt-2"
                                            >
                                                + Weitere Kontaktperson hinzufügen
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

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