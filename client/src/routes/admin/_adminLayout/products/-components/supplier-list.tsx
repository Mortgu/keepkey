import Button from "@/components/button/button";
import Input from "@/components/inputs/input";
import type { Supplier } from "@/data/types";
import { useSupplier } from "@/hooks/supplier";
import { useForm } from "@tanstack/react-form";
import { Loader, Pen, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { z } from 'zod';

const supplierSchema = z.object({
    name: z.string().min(1, "Lieferant braucht mindestens ein Zeichen!"),
    supplierId: z.string()
})

export default function SupplierList() {
    const [isOpen, setOpen] = useState<boolean>(false);
    const {
        suppliers,
        createSupplier,
        deleteSupplier,
        isCreatingSupplier,
        isDeletingSupplier,
    } = useSupplier();

    const supplierForm = useForm({
        defaultValues: { name: '', supplierId: '' },
        validators: {
            onChange: supplierSchema
        },
        onSubmit: async ({ value }) => {
            await createSupplier({ ...value })
            setOpen(false);

            return;
        }
    });

    const handleFormSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        supplierForm.handleSubmit();
    }

    return (
        <div className="grid gap-2">
            <div className='mb-4 flex items-center justify-between'>
                <h1 className='text-2xl font-medium flex items-center justify-center gap-4'>Lieferanten</h1>
                <Button disabled={isCreatingSupplier || isDeletingSupplier} onClick={() => setOpen(true)} size='sm'>
                    {isCreatingSupplier && (<Loader className='size-4' />)}
                    {!isCreatingSupplier && (<Plus className='size-4' />)}
                    Create
                </Button>
            </div>

            {suppliers.map((supplier: Supplier, idx: number) => (
                <div key={idx} className="rounded-md flex items-center justify-between gap-4 p-2 border border-gray-300">
                    <div className="grid">
                        <p>{supplier.name}</p>
                        <p className='text-sm text-gray-400'>{supplier.supplierId}</p>
                    </div>
                    <div>
                        <Button size='sm' variant='ghost' className='aspect-square'>
                            <Pen className='size-4' />
                        </Button>
                        <Button onClick={() => deleteSupplier(supplier.id)} size='sm' variant='ghost' className='aspect-square'>
                            <Trash className='size-4' />
                        </Button>
                    </div>
                </div>
            ))}

            {isOpen && (
                <form onSubmit={handleFormSubmit} className="rounded-md flex gap-2 p-2 border border-gray-300">
                    <supplierForm.Field name='name' children={(field) => (
                        <Input input_size="sm" id={field.name} name={field.name}
                            value={field.state.value} placeholder="Lieferanten Name" onChange={(e) => field.handleChange(e.target.value)} />
                    )} />
                    <supplierForm.Field name='supplierId' children={(field) => (
                        <Input input_size="sm" id={field.name} name={field.name}
                            value={field.state.value} placeholder="Lieferanten Id" onChange={(e) => field.handleChange(e.target.value)} />
                    )} />
                    <supplierForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}
                        children={([canSubmit, isSubmitting]) => (
                            <Button disabled={!canSubmit} type='submit' size='sm'>
                                {isSubmitting && <Loader className='animate-spin' />}
                                {!isSubmitting && ("Save")}
                            </Button>
                        )} />
                    <Button onClick={() => setOpen(false)} type='button' size='sm'
                        variant='secondary'>Cancel</Button>
                </form>
            )}
        </div>
    )
}