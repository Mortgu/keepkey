import Button from '@/components/button/button';
import Input from '@/components/inputs/input';
import { type ContactPerson, type User } from '@/data/types';
import { useAdmin } from '@/hooks/admin';
import { useForm } from '@tanstack/react-form';
import { Loader, Plus } from 'lucide-react';
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

export default function UserModal({ isOpen, onClose, currentUser }: UserModalProps) {
    if (!isOpen) return null;
    const isEdit = currentUser !== null;

    const { updateUser, createUser } = useAdmin();

    const [contactPersons, setContactPersons] = useState<ContactPerson[]>(currentUser?.contactPersons || []);
    /* const defaultValues: UserFormValues = currentUser
            ? { id: currentUser.id, salutation: currentUser.salutation, firstName: currentUser.firstName, lastName: currentUser.lastName, email: currentUser.email }
            : emptyUser;*/

    const userForm = useForm({
        defaultValues: currentUser || emptyUser,
        validators: {
            onChange: userSchema,
        },
        onSubmit: ({ value }) => {
            if (isEdit) {
                updateUser({ id: currentUser.id, body: value })
            }

            createUser({ body: value });

            onClose();
        }
    })

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
                            <div className='flex-1 rid gap-2'>
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

                    <div className='flex flex-col items-center'>
                        <div className='w-full'>
                            <Button onClick={() => { }} type='button' className='float-right' variant='link' icon={<Plus className='size-4' />} size='sm'>Kontaktperson hinzufügen</Button>
                        </div>

                        <div className='flex flex-col items-center w-full p-4'>
                            {contactPersons.length === 0 && (
                                <p className='text-sm text-gray-500'>Noch keine Kontakt Person</p>
                            )}
                        </div>

                        <div className='w-full'>


                            {contactPersons.map((contactPerson: ContactPerson) => (
                                <div></div>
                            ))}

                            <ContactPersonForm />
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