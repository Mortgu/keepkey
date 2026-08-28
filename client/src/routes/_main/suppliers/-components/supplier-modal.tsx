import { z } from 'zod';
import useSupplierForm from "../-hooks/use-supplier-form";
import type { Supplier } from "@keepit/schemas";
import { FieldInput, FormDialog } from "@/components";

interface Props {
    onClose: () => void;
    currentSupplier?: Supplier | null;
}

const supplierSchema = z.object({
    name: z.string().min(1, "Required!"),
    supplierId: z.string(),
})

export default function SupplierModal({ onClose, currentSupplier }: Props) {
    const { form, formId } = useSupplierForm({ currentSupplier: currentSupplier, closeFn: onClose });

    return (
        <FormDialog
            form={form}
            defaultOpen
            onClose={onClose}
            formId={formId}
            title={currentSupplier ? "Update Supplier" : "Create Supplier"}
        >
            <div className="flex items-center gap-2">
                        <form.Field name="name" children={(field) => (
                            <FieldInput field={field} label="Name" />
                        )} />

                        <form.Field name="supplierId" children={(field) => (
                            <FieldInput field={field} label="id" />
                        )} />
            </div>
        </FormDialog>
    )
}
