import Button from "@/components/button/button";
import type { Contract } from "@/data/types"
import { formatDate } from "@/lib/format"
import { Pen, Trash } from "lucide-react";
import { Fragment, useState } from "react";
import ContractModal from "./contract-modal";

interface ContractListItemProps {
    contract: Contract;
    deleteContract: (id: string) => void;
}

export default function ContractListItem({ contract, deleteContract }: ContractListItemProps) {
    const [isOpen, setOpen] = useState<boolean>(false);

    return (
        <Fragment>
            <div className="rounded-md flex items-center justify-between gap-4 p-2 border border-gray-300">
                <div className="grid gap-4">
                    <div className="grid">
                        <p>{contract.name}</p>
                        <p className='text-sm text-gray-400'>{formatDate(contract.createdAt)}</p>
                    </div>
                    <div className="border p-1 w-full rounded-md border-gray-300">
                        <ul>
                            {contract.features.map(i => (
                                <li key={i} className="text-gray-700 list-disc ml-5">{i}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="h-full flex items-center gap-0">
                    <div className="mb-auto">
                        <Button onClick={() => setOpen(true)} size='sm' variant='ghost' className='aspect-square'>
                            <Pen className='size-4' />
                        </Button>
                        <Button onClick={() => deleteContract(contract.id)} size='sm' variant='ghost' className='aspect-square'>
                            <Trash className='size-4' />
                        </Button>
                    </div>
                </div>
            </div>

            <ContractModal isOpen={isOpen} onClose={() => setOpen(false)}
                currentContract={contract} />
        </Fragment>
    )
}