import Button from '@/components/button/button';
import Input from '@/components/inputs/input';
import type { BaseContract, Contract } from '@/data/types';
import { useContracts } from '@/hooks/contract';
import { useForm } from '@tanstack/react-form';
import { Loader, Plus, Trash2, X } from 'lucide-react';
import { z } from 'zod';

interface ContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentContract?: Contract | null;
};

const contractSchema = z.object({
    name: z.string().min(1, "Mindestens 1 Zeichen!"),
    features: z.array(z.string()),
});

const emptyContract: BaseContract = {
    name: '',
    features: [],
}

export default function ContractModal({ isOpen, onClose, currentContract }: ContractModalProps) {
    if (!isOpen) return null;

    const { updateContract, createContract } = useContracts();

    const contractForm = useForm({
        defaultValues: currentContract || emptyContract,
        validators: {
            onChange: contractSchema
        },
        onSubmit: ({ value }) => {
            if (currentContract) {
                updateContract({ id: currentContract.id, data: value as BaseContract })
            } else {
                createContract(value as BaseContract);
            }
            onClose();
        }
    });

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        contractForm.handleSubmit();
    }

    return (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
            <div className="overflow-hidden relative bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center bg-gray-50 border-b border-gray-200 px-2 py-2">
                    <h1 className="text-xl ml-2">Contract bearbeiten</h1>
                    <Button onClick={onClose} variant="secondary" size="sm" icon={<X className="size-4" />} iconOnly />
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4 p-4">

                    <contractForm.Field name="name" children={(field) => (
                        <div className="grid gap-2">
                            <label className="text-sm text-gray-500" htmlFor={field.name}>Name:</label>
                            <Input
                                id={field.name}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                            />
                        </div>
                    )} />

                    <contractForm.Field name="features" children={(field) => (
                        <div className="grid gap-2">
                            <label className="text-sm text-gray-500">Features:</label>
                            <div className="grid gap-2">
                                {field.state.value.map((_, index) => (
                                    <contractForm.Field key={index} name={`features[${index}]`} children={(itemField) => (
                                        <div className="flex gap-2">
                                            <Input
                                                value={itemField.state.value}
                                                onChange={(e) => itemField.handleChange(e.target.value)}
                                                onBlur={itemField.handleBlur}
                                                placeholder={`Feature ${index + 1}`}
                                            />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                icon={<Trash2 className="size-4" />}
                                                iconOnly
                                                onClick={() => field.removeValue(index)}
                                            />
                                        </div>
                                    )} />
                                ))}
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                icon={<Plus className="size-4" />}
                                onClick={() => field.pushValue('')}
                            >
                                Feature hinzufügen
                            </Button>
                        </div>
                    )} />

                    <div className='flex gap-2'>
                        <Button onClick={onClose} className="flex-1" type='button' size='md' variant='secondary'>Abbrechen</Button>
                        <contractForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                            <Button disabled={!canSubmit} className="flex-1" type='submit' size='md'>
                                {isSubmitting ? <Loader className="size-4" /> : 'Speichern'}
                            </Button>
                        )} />
                    </div>

                </form>
            </div>
        </div>
    )
}