import { Fragment } from "react";
import SupplierModal from "./supplier-modal";
import type { Supplier } from "@/types";
import { useModal, useDeleteSupplier } from "@/hooks";
import { Badge, Button } from "@/components";
import { Pen, Trash } from "lucide-react";

type Props = {
    supplier: Supplier;
};

export default function SupplierListItem({ supplier }: Props) {
    const modal = useModal<Supplier>();

    const { deleteSupplier, isDeletingSupplier } = useDeleteSupplier();

    const handleDeleteSupplier = () => {
        if (confirm("Bist du dir sicher?")) {
            deleteSupplier(supplier.id);
        }
    }

    return (
        <Fragment>
            <div className="flex items-center justify-between bg-(--page-bg) border border-(--border) rounded-md overflow-hidden px-4 py-3">
                <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                        <p className="text-md">{supplier.name}</p>
                        {supplier.supplierId && (
                            <Badge variant="draft" className="text-sm">{supplier.supplierId}</Badge>
                        )}
                    </div>

                    <p className="text-sm text-(--text-secondary)">{supplier.offers.length} Angebot</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="border"
                        icon={<Pen className="size-3.5" />}
                        iconOnly
                        aria-label="Zulieferer bearbeiten"
                        onClick={() => modal.open(supplier)}
                    />
                    <Button
                        size="sm"
                        variant="border"
                        icon={<Trash className="size-3.5" />}
                        iconOnly
                        aria-label="Zulieferer löschen"
                        onClick={handleDeleteSupplier}
                        loading={isDeletingSupplier}
                    />
                </div>
            </div>

            {modal.isOpen && (
                <SupplierModal key={modal.key} currentSupplier={modal.data ?? undefined} onClose={modal.close} />
            )}
        </Fragment>
    )
}
