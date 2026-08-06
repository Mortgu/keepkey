import { useTranslation } from "react-i18next";
import SupplierListItem from "./supplier-list-item";
import { useSuppliers } from "@/hooks";
import type { SupplierFilter } from "../-hooks/use-supplier-filters";
import type { Supplier } from "@keepit/schemas";

interface Props {
    filters: SupplierFilter;
    onEdit: (supplier: Supplier) => void;
}

export default function SupplierList({ filters, onEdit }: Props) {
    const { t } = useTranslation();

    const { suppliers, isPending, error } = useSuppliers(filters.params);

    console.log(suppliers);

    return (
        <div className="grid gap-4">
            {suppliers.map((supplier) => (
                <SupplierListItem
                    key={supplier.id}
                    supplier={supplier}
                    onEdit={onEdit}
                />
            ))}
        </div>
    );
}
