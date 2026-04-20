import Button from '@/components/button/button';
import Input from '@/components/inputs/input';
import { type User } from '@/data/types';
import { useAdmin } from '@/hooks/admin';
import { useForm } from '@tanstack/react-form';
import { Loader } from 'lucide-react';
import { z } from 'zod';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User | null;
}

const userSchema = z.object({
    salutation: z.string().min(1, "Pflichtfeld"),
    firstName: z.string().min(1, "Pflichtfeld"),
    lastName: z.string().min(1, "Pflichtfeld"),
    email: z.email("Ungültige E-Mail"),
    password: z.string(),
});

export default function UserModal({ isOpen, onClose, currentUser }: UserModalProps) {
    if (!isOpen) return null;
    const isEdit = currentUser !== null;

    const { updateUser, createUser } = useAdmin();

    const userForm = useForm({
        defaultValues: {
            salutation: currentUser?.salutation ?? '',
            firstName: currentUser?.firstName ?? '',
            lastName: currentUser?.lastName ?? '',
            email: currentUser?.email ?? '',
            password: '',
        },
        validators: {
            onChange: userSchema,
        },
        onSubmit: ({ value }) => {
            const { password, ...rest } = value;
            const body: Partial<User> & { password?: string } = isEdit
                ? { ...rest }
                : { ...rest, password };

            if (isEdit) {
                updateUser({ id: currentUser.id, body });
            } else {
                createUser({ body });
            }
            onClose();
        }
    });

    return (
        <div className="fixed inset-0 bg-black/10 z-50 flex items-center justify-center p-4">
            <div className="p-4 relative bg-white rounded-lg shadow-2xl w-full max-w-2xl">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    userForm.handleSubmit();
                }} className="grid gap-4">

                    <div className='flex items-center gap-4'>
                        <userForm.Field name="salutation" children={(field) => (
                            <div className='flex-1 grid gap-2'>
                                <label htmlFor={field.name} className={`text-sm ${field.state.meta.errors.length > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                    {field.state.meta.errors.length > 0 ? String(field.state.meta.errors[0]) : 'Anrede'}
                                </label>
                                <Input id={field.name} input_size='sm' value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                            </div>
                        )} />

                        <userForm.Field name="firstName" children={(field) => (
                            <div className='flex-1 grid gap-2'>
                                <label htmlFor={field.name} className={`text-sm ${field.state.meta.errors.length > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                    {field.state.meta.errors.length > 0 ? String(field.state.meta.errors[0]) : 'Vorname'}
                                </label>
                                <Input id={field.name} input_size='sm' value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                            </div>
                        )} />

                        <userForm.Field name="lastName" children={(field) => (
                            <div className='flex-1 grid gap-2'>
                                <label htmlFor={field.name} className={`text-sm ${field.state.meta.errors.length > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                    {field.state.meta.errors.length > 0 ? String(field.state.meta.errors[0]) : 'Nachname'}
                                </label>
                                <Input id={field.name} input_size='sm' value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                            </div>
                        )} />
                    </div>

                    <div className='flex items-center gap-4'>
                        <userForm.Field name="email" children={(field) => (
                            <div className='flex-1 grid gap-2'>
                                <label htmlFor={field.name} className={`text-sm ${field.state.meta.errors.length > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                    {field.state.meta.errors.length > 0 ? String(field.state.meta.errors[0]) : 'E-Mail'}
                                </label>
                                <Input id={field.name} input_size='sm' value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                            </div>
                        )} />

                        {!isEdit && (
                            <userForm.Field
                                name="password"
                                validators={{
                                    onChange: ({ value }) =>
                                        !value || value.length < 8 ? "Mindestens 8 Zeichen" : undefined,
                                }}
                                children={(field) => (
                                    <div className='flex-1 grid gap-2'>
                                        <label htmlFor={field.name} className={`text-sm ${field.state.meta.errors.length > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                            {field.state.meta.errors.length > 0 ? String(field.state.meta.errors[0]) : 'Passwort'}
                                        </label>
                                        <Input id={field.name} type="password" input_size='sm' value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </div>
                                )}
                            />
                        )}
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
