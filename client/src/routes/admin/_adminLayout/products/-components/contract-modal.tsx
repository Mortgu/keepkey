import Button from '@/components/button/button';
import Input from '@/components/inputs/input';
import ModalDialog from '@/components/modal';
import type { BaseContract, Contract } from '@/data/types';
import { useContracts } from '@/hooks/contract';
import { useForm } from '@tanstack/react-form';
import { Loader, Plus, Trash2, X } from 'lucide-react';
import { z } from 'zod';

interface ContractModalProps {
    open: boolean;
    cancelFn: () => void;
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

export default function ContractModal({ open, cancelFn, currentContract = null }: ContractModalProps) {
    const isEdit = currentContract !== null;
    const { updateContract, createContract } = useContracts();

    const contractForm = useForm({
        defaultValues: currentContract || emptyContract,
        validators: {
            onChange: contractSchema
        },
        onSubmit: ({ value }) => {
            if (isEdit) {
                updateContract({ id: currentContract.id, data: value as BaseContract })
            } else {
                createContract(value as BaseContract);
            }
            cancelFn();
        }
    });

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        contractForm.handleSubmit();
    }

    return (
        <ModalDialog open={open} cancelFn={cancelFn}>
            <ModalDialog.Header>
                <h1 className='text-lg'>
                    {isEdit && 'Vertrag bearbeiten'}
                    {!isEdit && 'Neuen Vertrag anlegen'}
                </h1>
            </ModalDialog.Header>
            <ModalDialog.Content>
                <form id="contract-form" onSubmit={handleSubmit} className="grid gap-4">

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

                    </div>

                </form>
            </ModalDialog.Content>
            <ModalDialog.Footer>
                <Button onClick={cancelFn} type='button' size='xs' variant='secondary'>Abbrechen</Button>
                <contractForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                    <Button form="contract-form" disabled={!canSubmit} type='submit' size='xs'>
                        {isSubmitting ? <Loader className="size-4" /> : 'Speichern'}
                    </Button>
                )} />
            </ModalDialog.Footer>
        </ModalDialog>
    )
}