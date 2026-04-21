import Button from '@/components/button/button';
import Input from '@/components/inputs/input';
import { type BaseUser, type User } from '@/data/types';
import { useAdmin } from '@/hooks/admin';
import { useForm } from '@tanstack/react-form';
import { Loader } from 'lucide-react';
import type React from 'react';
import { z } from 'zod';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User | null;
}

const createUserSchema = z.object({
    salutation: z.string().min(1, "Pflichtfeld"),
    firstName: z.string().min(1, "Pflichtfeld"),
    lastName: z.string().min(1, "Pflichtfeld"),
    email: z.email("Ungültige E-Mail"),
    password: z.string().min(8, "Pflichtfeld (8)"),
});

const editUserSchema = createUserSchema.extend({
    password: z.string().refine(val => val === '' || val.length >= 8, "Mind. 8 Zeichen"),
});

const emptyUser = {
    salutation: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
};

export default function UserModal({ isOpen, onClose, currentUser }: UserModalProps) {
    if (!isOpen) return null;
    const isEdit = currentUser !== null;

    const { updateUser, createUser } = useAdmin();

    const userForm = useForm({
        defaultValues: currentUser ? { ...currentUser, password: '' } : emptyUser,
        validators: {
            onChange: isEdit ? editUserSchema : createUserSchema,
        },
        onSubmit: async ({ value }) => {
            const name = `${value.firstName} ${value.lastName}`;
            if (isEdit) {
                updateUser({ id: currentUser.id, body: { ...value, name } });
            } else {
                await createUser({ body: { ...value, name } });
            }
            onClose();
        },
    });

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        userForm.handleSubmit();
    }

    return (
        <div className="fixed inset-0 bg-black/10 z-50 flex items-center justify-center p-4">
            <div className="p-4 relative bg-white rounded-lg shadow-2xl w-full max-w-2xl">
                <form onSubmit={handleSubmit} className="grid gap-4">

                    <div className='flex items-center gap-4'>
                        <userForm.Field name="salutation" children={(field) => (
                            <div className='flex-1 grid gap-2'>
                                <label htmlFor={field.name} className={`text-sm ${field.state.meta.errors.length > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                    Anrede
                                </label>
                                <Input id={field.name} input_size='sm' value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                            </div>
                        )} />

                        <userForm.Field name="firstName" children={(field) => (
                            <div className='flex-1 grid gap-2'>
                                <label htmlFor={field.name} className={`text-sm ${field.state.meta.errors.length > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                    Vorname
                                </label>
                                <Input id={field.name} input_size='sm' value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                            </div>
                        )} />

                        <userForm.Field name="lastName" children={(field) => (
                            <div className='flex-1 grid gap-2'>
                                <label htmlFor={field.name} className={`text-sm ${field.state.meta.errors.length > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                    Nachname
                                </label>
                                <Input id={field.name} input_size='sm' value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                            </div>
                        )} />
                    </div>

                    <div className='flex items-center gap-4'>
                        <userForm.Field name="email" children={(field) => (
                            <div className='flex-1 grid gap-2'>
                                <label htmlFor={field.name} className={`text-sm ${field.state.meta.errors.length > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                    E-Mail
                                </label>
                                <Input id={field.name} input_size='sm' value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                            </div>
                        )} />

                        <userForm.Field name="password" children={(field) => (
                            <div className='flex-1 grid gap-2'>
                                <label htmlFor={field.name} className={`text-sm ${field.state.meta.errors.length > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                    Passwort
                                </label>
                                <Input id={field.name} type="password" input_size='sm' value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                            </div>
                        )} />
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
