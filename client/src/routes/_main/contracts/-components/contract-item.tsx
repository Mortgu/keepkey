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
            <div className="bg-white border border-(--border) rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-(--border)">
                    <div>
                        <p className="text-md text-(--text)">{contract.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(contract.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" icon={<Pen className="size-3.5" />} iconOnly onClick={() => setOpen(true)} size="sm" />
                        <Button variant="ghost" icon={<Trash className="size-3.5" />} iconOnly onClick={() => deleteContract(contract.id)} size="sm" />
                    </div>
                </div>

                {/* Body */}
                <div className="px-4 py-3.5">
                    <ul className="flex flex-col gap-1.5">
                        {contract.features.map(feature => (
                            <li key={feature} className="flex items-start gap-2 text-sm text-(--text) leading-snug">
                                <span className="w-1.25 h-1.25 rounded-full bg-(--text) shrink-0 mt-1.5" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <ContractModal open={isOpen} cancelFn={() => setOpen(false)} currentContract={contract} />
        </Fragment>
    );
}
