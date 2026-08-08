import { Dot, Pen, Trash } from "lucide-react";
import type { Supplier } from "@keepit/schemas";
import { useDeleteSupplier } from "@/hooks";
import { Badge, Button } from "@/components";
import { formatDate } from "@/lib/format";

type Props = {
    supplier: Supplier;
    onEdit: (supplier: Supplier) => void;
};

export default function SupplierListItem({ supplier, onEdit }: Props) {
    const { deleteSupplier, isDeletingSupplier } = useDeleteSupplier();

    const handleDeleteSupplier = () => {
        if (confirm("Bist du dir sicher?")) {
            deleteSupplier(supplier.id);
        }
    }

    return (
        <div className="grid items-center border border-(--border) rounded-md overflow-hidden">
            <div className="grid bg-(--page-bg) px-4 py-3">
                <div className="flex items-center gap-2">
                    <p className="text-md">{supplier.name}</p>
                    {supplier.supplierId && (
                        <Badge variant="GENERATED" className="text-sm">{supplier.supplierId}</Badge>
                    )}
                </div>

                <p className="text-sm text-(--text-secondary)">{formatDate(supplier.createdAt)}</p>

            </div>

            <div className="flex items-center justify-between border-t border-(--border) px-4 py-2">

                <div className="flex items-center">
                    <p className="text-sm">{supplier._count.offers} Angebot</p>
                    <Dot size={18} />
                    <p className="text-sm">{supplier._count.orders} Bestellungen</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="xs"
                        variant="border"
                        icon={<Pen size={14} />}
                        iconOnly
                        aria-label="Zulieferer bearbeiten"
                        onClick={() => onEdit(supplier)}
                    />
                    <Button
                        size="xs"
                        variant="border"
                        icon={<Trash size={14} />}
                        iconOnly
                        aria-label="Zulieferer löschen"
                        onClick={handleDeleteSupplier}
                        loading={isDeletingSupplier}
                    />
                </div>

            </div>

        </div>
    )
}
