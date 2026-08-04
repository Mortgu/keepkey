import ContractListItem from "./contract-item";

import { useContracts } from "@/hooks/contracts/contract-hooks";
import type { Contract } from "@keepit/schemas";
import { LoaderCircle } from "lucide-react";

interface Props {
    onEdit: (contract: Contract) => void;
}

export default function ContractList({ onEdit }: Props) {
    const { contracts, isPending, error } = useContracts();

    return (
        <div className="grid gap-4">
            {isPending && (
                <div className="w-full flex items-center justify-center py-8">
                    <LoaderCircle className="animate-spin" />
                </div>
            )}

            {error && (
                <div className="w-full grid items-center justify-start py-8">
                    <p className="text-(--destructive) text-lg font-semibold">Error</p>
                    <p className="text-(--destructive) font-medium">Something went wrong trying to fetch flatrates!</p>
                </div>
            )}

            {contracts.map((contract, _) => (
                <ContractListItem
                    key={contract.id}
                    contract={contract}
                    onEdit={onEdit}

                />
            ))}
        </div>
    );
}
