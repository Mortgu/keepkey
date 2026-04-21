import Button from '@/components/button/button';
import Input from '@/components/inputs/input';
import { type BaseContactPerson, type BaseCustomer, type ContactPerson, type Customer } from '@/data/types';
import { useCustomers } from '@/hooks/customer';
import { useForm } from '@tanstack/react-form';
import { Loader, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';
import ContactPersonForm from './contact-person-form';

interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentCustomer?: Customer | null;
}

const customerSchema = z.object({
    customerId: z.string().min(1, "min. 1 Zeichen!"),
    companyName: z.string().min(1, "min. 1 Zeichen!"),
    email: z.email(),
});

export default function CustomerModal({ isOpen, onClose, currentCustomer = null }: CustomerModalProps) {
    if (!isOpen) return null;
    const isEdit = currentCustomer !== null;

    const { updateCustomer, createCustomer, errorCreatingCustomer } = useCustomers();

    const [contactPersons, setContactPersons] = useState<BaseContactPerson[]>(
        currentCustomer?.contactPersons?.map(({ salutation, firstName, lastName, email }) => ({
            salutation,
            firstName,
            lastName,
            email: email ?? undefined,
        })) ?? []
    );
    const [showContactForm, setShowContactForm] = useState(false);

    const customerForm = useForm({
        defaultValues: {
            customerId: currentCustomer?.customerId ?? '',
            companyName: currentCustomer?.companyName ?? '',
            email: currentCustomer?.email ?? '',
        },
        validators: {
            onChange: customerSchema
        },
        onSubmit: ({ value }) => {
            const body = { ...value, contactPersons };

            if (isEdit) {
                try {
                    updateCustomer({ id: currentCustomer.id, body });
                    onClose();
                } catch (exception: any) { }
            } else {
                try {
                    createCustomer(body);
                    onClose();
                } catch (exception: any) { }
            }
        }
    });

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        customerForm.handleSubmit();
    }

    const handleAddContactPerson = (data: BaseContactPerson) => {
        setContactPersons(prev => [...prev, data]);
        setShowContactForm(false);
    };

    const handleRemoveContactPerson = (index: number) => {
        setContactPersons(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
            <div className="overflow-hidden relative bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center bg-gray-50 border-b border-gray-200 px-2 py-2">
                    <h1 className="text-xl ml-2">
                        {isEdit && 'Kunden bearbeiten'}
                        {!isEdit && 'Neuen Kunden anlegen'}
                    </h1>
                    <Button onClick={onClose} variant="secondary" size="sm" icon={<X className="size-4" />} iconOnly />
                </div>

                {errorCreatingCustomer && (
                    <div className='p-4 bg-red-50'>
                        <p>{errorCreatingCustomer?.message}</p>
                    </div>
                )}

                <div className='p-4'>
                    <form onSubmit={handleSubmit} className="grid gap-4">

                        <div className='flex items-center gap-4'>
                            <customerForm.Field name="customerId" children={(field) => (
                                <div className='flex-1 grid gap-2'>
                                    {field.state.meta.errors.length > 0 ? (
                                        <label htmlFor={field.name} className='text-sm text-red-400'>
                                            {field.state.meta.errors.map(err => typeof err === 'object' ? err.message : err).join(', ')}
                                        </label>
                                    ) : (
                                        <label htmlFor={field.name} className='text-sm text-gray-500'>Kunden-Nr.</label>
                                    )}
                                    <Input id={field.name} input_size='sm' value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)} />
                                </div>
                            )} />

                            <customerForm.Field name="companyName" children={(field) => (
                                <div className='flex-2 grid gap-2'>
                                    {field.state.meta.errors.length > 0 ? (
                                        <label htmlFor={field.name} className='text-sm text-red-400'>
                                            {field.state.meta.errors.map(err => typeof err === 'object' ? err.message : err).join(', ')}
                                        </label>
                                    ) : (
                                        <label htmlFor={field.name} className='text-sm text-gray-500'>Firmenname</label>
                                    )}
                                    <Input id={field.name} input_size='sm' value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                </div>
                            )} />
                        </div>

                        <div className='flex items-center gap-4'>
                            <customerForm.Field name="email" children={(field) => (
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
                                <p className='text-sm text-gray-500 text-center py-2'>Noch keine Kontaktperson</p>
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
                            <customerForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                                <Button disabled={!canSubmit} className="flex-1" size='md'>
                                    {isSubmitting ? <Loader className="size-4 animate-spin" /> : 'Speichern'}
                                </Button>
                            )} />
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
