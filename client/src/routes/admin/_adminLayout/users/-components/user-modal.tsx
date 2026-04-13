import Button from '@/components/button/button';
import Input from '@/components/inputs/input';
import { type User } from '@/data/types';
import { useAdmin } from '@/hooks/admin';
import { useForm } from '@tanstack/react-form';
import { Loader, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';
import ContactPersonForm from './contact-person-form';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User | null;
}

const userSchema = z.object({
    id: z.string().min(1, "Mindestens 1 Zeichen!"),
    salutation: z.string().min(1, "Mindestens 1 Zeichen!"),
    firstName: z.string().min(1, "Mindestens 1 Zeichen!"),
    lastName: z.string().min(1, "Mindestens 1 Zeichen!"),
    email: z.email(),
});

type UserFormValues = {
    id: string;
    salutation: string;
    firstName: string;
    lastName: string;
    email: string;
}

const emptyUser: UserFormValues = {
    id: "",
    salutation: "",
    firstName: "",
    lastName: "",
    email: ""
}

type ContactPersonInput = {
    salutation: string;
    firstName: string;
    lastName: string;
    email?: string;
};

export default function UserModal({ isOpen, onClose, currentUser }: UserModalProps) {
    if (!isOpen) return null;
    const isEdit = currentUser !== null;

    const { updateUser, createUser } = useAdmin();

    const [contactPersons, setContactPersons] = useState<ContactPersonInput[]>(
        currentUser?.contactPersons?.map(({ salutation, firstName, lastName, email }) => ({
            salutation: String(salutation),
            firstName: String(firstName),
            lastName: String(lastName),
            email: email ? String(email) : undefined,
        })) ?? []
    );
    const [showContactForm, setShowContactForm] = useState(false);

    const userForm = useForm({
        defaultValues: currentUser
            ? { id: currentUser.id, salutation: currentUser.salutation, firstName: currentUser.firstName, lastName: currentUser.lastName, email: currentUser.email }
            : emptyUser,
        validators: {
            onChange: userSchema,
        },
        onSubmit: ({ value }) => {
            const body = { ...value, contactPersons } as unknown as Partial<User>;
            if (isEdit) {
                updateUser({ id: currentUser.id, body });
            } else {
                createUser({ body });
            }
            onClose();
        }
    });

    const handleAddContactPerson = (data: ContactPersonInput) => {
        setContactPersons(prev => [...prev, data]);
        setShowContactForm(false);
    };

    const handleRemoveContactPerson = (index: number) => {
        setContactPersons(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 bg-black/10 z-50 flex items-center justify-center p-4">
            <div className="p-4 relative bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    userForm.handleSubmit();
                }} className="grid gap-4">

                    <div className='flex items-center gap-4'>
                        <userForm.Field name="salutation" children={(field) => (
                            <div className='flex-1 grid gap-2'>
                                {field.state.meta.errors.length > 0 ? (
                                    <label htmlFor={field.name} className='text-sm text-red-400'>
                                        {field.state.meta.errors.map(err => typeof err === 'object' ? err.message : err).join(', ')}
                                    </label>
                                ) : (
                                    <label htmlFor={field.name} className='text-sm text-gray-500'>Anrede</label>
                                )}
                                <Input id={field.name} input_size='sm' value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                            </div>
                        )} />

                        <userForm.Field name="firstName" children={(field) => (
                            <div className='flex-1 grid gap-2'>
                                {field.state.meta.errors.length > 0 ? (
                                    <label htmlFor={field.name} className='text-sm text-red-400'>
                                        {field.state.meta.errors.map(err => typeof err === 'object' ? err.message : err).join(', ')}
                                    </label>
                                ) : (
                                    <label htmlFor={field.name} className='text-sm text-gray-500'>Vorname</label>
                                )}
                                <Input id={field.name} input_size='sm' value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                            </div>
                        )} />

                        <userForm.Field name="lastName" children={(field) => (
                            <div className='flex-1 grid gap-2'>
                                {field.state.meta.errors.length > 0 ? (
                                    <label htmlFor={field.name} className='text-sm text-red-400'>
                                        {field.state.meta.errors.map(err => typeof err === 'object' ? err.message : err).join(', ')}
                                    </label>
                                ) : (
                                    <label htmlFor={field.name} className='text-sm text-gray-500'>Nachname</label>
                                )}
                                <Input id={field.name} input_size='sm' value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                            </div>
                        )} />
                    </div>

                    <div className='flex items-center gap-4'>
                        <userForm.Field name="id" children={(field) => (
                            <div className='flex-1 grid gap-2'>
                                {field.state.meta.errors.length > 0 ? (
                                    <label htmlFor={field.name} className='text-sm text-red-400'>
                                        {field.state.meta.errors.map(err => typeof err === 'object' ? err.message : err).join(', ')}
                                    </label>
                                ) : (
                                    <label htmlFor={field.name} className='text-sm text-gray-500'>Kunden-Nr.</label>
                                )}
                                <Input id={field.name} input_size='sm' value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                            </div>
                        )} />

                        <userForm.Field name="email" children={(field) => (
                            <div className='flex-1 grid gap-2'>
                                {field.state.meta.errors.length > 0 ? (
                                    <label htmlFor={field.name} className='text-sm text-red-400'>
                                        {field.state.meta.errors.map(err => typeof err === 'object' ? err.message : err).join(', ')}
                                    </label>
                                ) : (
                                    <label htmlFor={field.name} className='text-sm text-gray-500'>E-Mail</label>
                                )}
                                <Input id={field.name} input_size='sm' value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                            </div>
                        )} />
                    </div>

                    <hr className='h-px text-transparent bg-gray-200' />

                    <div className='flex flex-col gap-2'>
                        <div className='w-full'>
                            <Button
                                onClick={() => setShowContactForm(true)}
                                type='button'
                                className='float-right'
                                variant='link'
                                icon={<Plus className='size-4' />}
                                size='sm'
                                disabled={showContactForm}
                            >
                                Kontaktperson hinzufügen
                            </Button>
                        </div>

                        {contactPersons.length === 0 && !showContactForm && (
                            <p className='text-sm text-gray-500 text-center py-2'>Noch keine Kontakt Person</p>
                        )}

                        <div className='flex flex-col gap-2 w-full'>
                            {contactPersons.map((cp, index) => (
                                <div key={index} className='flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-2'>
                                    <span className='text-sm text-gray-700'>
                                        {cp.salutation} {cp.firstName} {cp.lastName}{cp.email ? ` · ${cp.email}` : ''}
                                    </span>
                                    <button
                                        type='button'
                                        onClick={() => handleRemoveContactPerson(index)}
                                        className='text-gray-400 hover:text-red-500 transition-colors'
                                    >
                                        <Trash2 className='size-4' />
                                    </button>
                                </div>
                            ))}

                            {showContactForm && (
                                <ContactPersonForm
                                    onSave={handleAddContactPerson}
                                    onCancel={() => setShowContactForm(false)}
                                />
                            )}
                        </div>
                    </div>

                    <div className='flex items-center gap-4'>
                        <Button onClick={onClose} className='flex-1' variant="secondary" size='md'>Abbrechen</Button>
                        <userForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                            <Button disabled={!canSubmit} className="flex-1" size='md'>
                                {isSubmitting ? <Loader className="size-4 animate-spin" /> : 'Speichern'}
                            </Button>
                        )} />
                    </div>

                </form>
            </div>
        </div>
    );
}
