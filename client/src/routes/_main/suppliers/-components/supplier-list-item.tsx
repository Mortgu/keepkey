import { Badge, Button } from "@/components";
import { useSupplierHook } from "@/hooks";
import type { Supplier } from "@/types";
import { Pen, Trash } from "lucide-react";
import { Fragment, useState } from "react";
import SupplierModal from "./supplier-modal";

type Props = {
    supplier: Supplier;
};

export default function SupplierListItem({ supplier }: Props) {
    const [isEdit, setEdit] = useState<boolean>(false);

    const { deleteSupplier } = useSupplierHook();

    const handleDeleteSupplier = () => {
        if (confirm("Bist du dir sicher?")) {
            deleteSupplier(supplier.id);
        }
    }

    return (
        <Fragment>
            <div className="flex items-center justify-between bg-white border border-(--border) rounded-md overflow-hidden px-4 py-3">
                <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                        <p className="text-md">{supplier.name}</p>
                        {supplier.supplierId && (
                            <Badge variant="draft" className="text-sm">{supplier.supplierId}</Badge>
                        )}
                    </div>

                    <p className="text-sm text-(--text-secondary)">{supplier.offers?.length ?? 0} Angebot</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="secondary" icon={<Pen className="size-3.5" />} iconOnly
                        onClick={() => setEdit(true)} />

                    <Button variant="secondary" icon={<Trash className="size-3.5" />} iconOnly
                        onClick={handleDeleteSupplier} />
                </div>
            </div>

            <SupplierModal open={isEdit} cancelFn={() => setEdit(false)} currentSupplier={supplier} />
        </Fragment>
    )
}