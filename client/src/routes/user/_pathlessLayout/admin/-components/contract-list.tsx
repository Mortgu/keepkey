import { Loader, Plus, Trash } from "lucide-react";
import Button from "@/components/button/button.tsx";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useContracts } from "@/hooks/contract.ts";

type Contract = {
    id: string;
    name: string;
}

export default function ContractList() {
    const { contracts, isPending, error, createContract, deleteContract } = useContracts();

    const [isOpen, setOpen] = useState<boolean>(false);


    const form = useForm({
        defaultValues: { name: "" },
        validators: {
            onChange: z.object({
                name: z.string().min(2),
            }),
        },

        onSubmit: async ({ value }) => {
            return await createContract(value.name);
        },
    });

    if (isPending) {
        return (
            <Loader className='animate-spin' />
        )
    }

    if (error) {
        return (
            <div className='p-2 bg-red-200 border border-red-400 rounded-lg'>
                <p className="text-lg">Error</p>
                <p>{error.message}</p>
            </div>
        )
    }

    return (
        <div>
            <div className='mb-4 flex items-center justify-between'>
                <h1 className='text-2xl font-medium flex items-center justify-center gap-4'>Contracts ({contracts.length})</h1>
                <Button onClick={() => setOpen(true)} size='sm'>Create <Plus className='size-4' /></Button>
            </div>
            <div className='grid gap-2'>
                {contracts.map((contract: Contract) => (
                    <div key={contract.id} className="rounded-md flex items-center justify-between gap-4 p-2 border border-gray-300">
                        <div>
                            <p>{contract.name}</p>
                            <p className='text-sm text-gray-400'>{contract.id}</p>
                        </div>
                        <Button onClick={() => deleteContract(contract.id)} size='sm' variant='ghost' className='aspect-square'>
                            <Trash className='size-4' />
                        </Button>
                    </div>
                ))}
                {isOpen && (
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit(form);
                    }} className="rounded-md flex gap-2 p-2 border border-gray-300">
                        <form.Field name='name' children={(field) => (
                            <input id={field.name} name={field.name}
                                className='flex-1 outline-none border border-gray-300 p-1 rounded-md'
                                value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                        )} />
                        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}
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
        </div>
    )
}