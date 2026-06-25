import { Button } from "@/components";
import { Plus } from "lucide-react";
import PricingTableItem from "./pricing-table-icon";
import { useContracts } from "@/hooks/contracts/contract-hooks";

export default function PricingTable() {

    const { contracts } = useContracts();

    return (
        <div className="border border-(--border) rounded-md overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between border-b border-(--border) bg-(--page-bg)">
                <div>
                    <p className="text-md font-normal flex gap-1">
                        <span className="hover:underline cursor-pointer">Entra ID Advanced</span>,
                        <span className="hover:underline cursor-pointer">Microsoft 365</span>
                    </p>
                    <p className="text-sm text-(--text-secondary)">20. April 2026</p>
                </div>

                <div>
                    <Button size="sm" variant="secondary" icon={<Plus className="size-3.5" />} iconOnly />
                </div>
            </div>

            <div className="grid">
                {contracts.map(contract => (
                    <PricingTableItem key={contract.id} contract={contract} />
                ))}
            </div>
        </div>

    )
}