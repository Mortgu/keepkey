import Button from '@/components/button/button';
import Input from '@/components/inputs/input';
import { type BaseContactPerson, type BaseCustomer, type ContactPerson, type Customer } from '@/data/types';
import { useCustomers } from '@/hooks/customer';
import { useForm } from '@tanstack/react-form';
import { Loader, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';
import ContactPersonForm from './contact-person-form';
import ModalDialog from '@/components/modal';

interface CustomerModalProps {
    open: boolean;
    cancelFn: () => void;
    currentCustomer?: Customer | null;
}

const customerSchema = z.object({
    customerId: z.string().min(1, "min. 1 Zeichen!"),
    companyName: z.string().min(1, "min. 1 Zeichen!"),
    email: z.email(),
});

export default function CustomerModal({ open, cancelFn, currentCustomer = null }: CustomerModalProps) {
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
                    cancelFn();
                } catch (exception: any) { }
            } else {
                try {
                    createCustomer(body);
                    cancelFn();
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
        <ModalDialog open={open} cancelFn={cancelFn}>
            <ModalDialog.Header>
                <h1 className="text-lg">
                    {isEdit && 'Kunden bearbeiten'}
                    {!isEdit && 'Neuen Kunden anlegen'}
                </h1>
            </ModalDialog.Header>
            <ModalDialog.Content>
                {errorCreatingCustomer && (
                    <div className='p-4 bg-red-50'>
                        <p>{errorCreatingCustomer?.message}</p>
                    </div>
                )}

                <form id="customer-form" onSubmit={handleSubmit} className="grid gap-4">

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
                                <div key={index} className='flex items-center justify-between bg-gray-50 border border-(--border) rounded-md px-3 py-2'>
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
                </form>
            </ModalDialog.Content>
            <ModalDialog.Footer>
                <Button onClick={cancelFn} variant="secondary" size='xs'>Abbrechen</Button>
                <customerForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                    <Button form="customer-form" disabled={!canSubmit} size='xs'>
                        {isSubmitting ? <Loader className="size-4 animate-spin" /> : 'Speichern'}
                    </Button>
                )} />
            </ModalDialog.Footer>
        </ModalDialog>


    );
}
