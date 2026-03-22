import {Loader, Plus, Trash} from "lucide-react";
import {useMutation, useQuery} from "@tanstack/react-query";
import Button from "@/components/button/button.tsx";
import {deleteContract, getAllContracts} from "@/data/contracts.ts";
import {useState} from "react";
import {useForm} from "@tanstack/react-form";
import {z} from "zod";

type Contract = {
    id: string;
    name: string;
}

export default function ContractList() {
    const [isOpen, setOpen] = useState<boolean>(false);

    const {data, isPending, error} = useQuery({
        queryKey: ['contracts'],
        queryFn: getAllContracts,
    });

    const form = useForm({
        defaultValues: {name: ""},
        validators: {
            onChange: z.object({
                name: z.string().min(2),
            }),
        },

        onSubmit: async ({value}) => {
            const response = await fetch("http://localhost:3000/api/contracts", {
                method: "POST",
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({name: value.name})
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            setOpen(false);
            window.location.reload();
            return result;
        },
    });

    const {mutate: handleContractDelete} = useMutation({
        mutationKey: ['contracts'],
        mutationFn: deleteContract,
        onSuccess: () => window.location.reload(),
        onError: error => console.log(error),
    })

    if (isPending) {
        return (
            <Loader className='animate-spin'/>
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
                <h1 className='text-2xl font-medium flex items-center justify-center gap-4'>Contracts <span
                    className='p-2 rounded-md bg-gray-200 text-sm flex items-center justify-center'>{data.length}</span>
                </h1>
                <Button onClick={() => setOpen(true)} size='sm'>Create <Plus className='size-4'/></Button>
            </div>
            <div className='grid gap-2'>
                {data.map((contract: Contract) => (
                    <div key={contract.id}
                         className="rounded-md flex items-center justify-between gap-4 p-2 border border-gray-300 cursor-pointer">
                        {contract.name}
                        <Button onClick={() => handleContractDelete({id: contract.id})} size='sm' variant='ghost'>
                            <Trash className='size-4'/>
                        </Button>
                    </div>
                ))}
                {isOpen && (
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit(form);
                    }} className="rounded-md flex gap-4 p-2 border border-gray-300 hover:bg-gray-100 cursor-pointer">
                        <form.Field name='name' children={(field) => (
                            <input id={field.name} name={field.name}
                                   className='flex-1 outline-none border border-gray-300 p-1 rounded-md'
                                   value={field.state.value} onChange={(e) => field.handleChange(e.target.value)}/>
                        )}/>
                        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}
                                        children={([canSubmit, isSubmitting]) => (
                                            <Button disabled={!canSubmit} type='submit' size='sm'>
                                                {isSubmitting && <Loader className='animate-spin' /> }
                                                {!isSubmitting && ("Save")}
                                            </Button>
                                        )}/>
                        <Button onClick={() => setOpen(false)} type='button' size='sm'
                                variant='secondary'>Cancel</Button>
                    </form>
                )}
            </div>
        </div>
    )
}