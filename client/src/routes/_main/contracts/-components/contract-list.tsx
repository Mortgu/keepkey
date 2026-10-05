import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { LoaderCircle } from "lucide-react";
import ContractListItem from "./contract-item";
import type { DragEndEvent } from "@dnd-kit/core";
import type { Contract } from "@keepit/schemas";
import { useContracts } from "@/hooks/contracts/contract-hooks";
import { useReorderContracts } from "@/hooks/contracts/contract-mutations";

interface Props {
    onEdit: (contract: Contract) => void;
}

export default function ContractList({ onEdit }: Props) {
    const { contracts, isPending, error } = useContracts();
    const { reorderContracts } = useReorderContracts();

    const sensors = useSensors(
        // Kleiner Schwellwert, damit ein Klick auf den Griff kein Ziehen auslöst.
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) return;

        const from = contracts.findIndex((contract) => contract.id === active.id);
        const to = contracts.findIndex((contract) => contract.id === over.id);
        if (from === -1 || to === -1) return;

        reorderContracts(arrayMove(contracts, from, to));
    };

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

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={contracts.map((contract) => contract.id)} strategy={verticalListSortingStrategy}>
                    {contracts.map((contract, index) => (
                        <ContractListItem
                            key={contract.id}
                            contract={contract}
                            isDefault={index === 0}
                            onEdit={onEdit}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
}
