import { Fragment } from "react";
import SupplierModal from "./supplier-modal";
import type { Supplier } from "@/types";
import { useModal, useSupplierHook } from "@/hooks";
import { Badge, ListItemRow } from "@/components";

type Props = {
    supplier: Supplier;
};

export default function SupplierListItem({ supplier }: Props) {
    const modal = useModal<Supplier>();

    const { deleteSupplier } = useSupplierHook();

    const handleDeleteSupplier = () => {
        if (confirm("Bist du dir sicher?")) {
            deleteSupplier(supplier.id);
        }
    }

    return (
        <Fragment>
            <ListItemRow
                onEdit={() => modal.open(supplier)}
                onDelete={handleDeleteSupplier}
                editLabel="Zulieferer bearbeiten"
                deleteLabel="Zulieferer löschen"
            >
                <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                        <p className="text-md">{supplier.name}</p>
                        {supplier.supplierId && (
                            <Badge variant="draft" className="text-sm">{supplier.supplierId}</Badge>
                        )}
                    </div>

                    <p className="text-sm text-(--text-secondary)">{supplier.offers.length} Angebot</p>
                </div>
            </ListItemRow>

            {modal.isOpen && (
                <SupplierModal key={modal.key} currentSupplier={modal.data ?? undefined} onClose={modal.close} />
            )}
        </Fragment>
    )
}
