import { useForm } from "@tanstack/react-form";
import { z } from 'zod';
import type { Supplier } from "@/types";
import { FieldInput, FormModal } from "@/components";
import { useSupplierHook } from "@/hooks";

interface SupplierModalProps {
    onClose: () => void;
    currentSupplier?: Supplier;
}

const supplierSchema = z.object({
    name: z.string().min(1, "Required!"),
    supplierId: z.string(),
})

export default function SupplierModal({ onClose, currentSupplier }: SupplierModalProps) {
    const isEdit = !!currentSupplier;

    const {
        createSupplier,
        errorCreatingSupplier,
        updateSupplier,
        errorUpdateingSupplier,
    } = useSupplierHook();

    const supplierForm = useForm({
        defaultValues: {
            name: currentSupplier?.name ?? '',
            supplierId: currentSupplier?.supplierId ?? ''
        },
        validators: {
            onChange: supplierSchema,
            onMount: supplierSchema,
        },
        onSubmit: ({ value }) => {
            if (isEdit) updateSupplier({ id: currentSupplier.id, supplier: value })
            else createSupplier(value);

            if (!errorCreatingSupplier && !errorUpdateingSupplier) {
                onClose();
            }
        }
    });

    return (
        <FormModal
            form={supplierForm}
            onClose={onClose}
            title={<h1 className="text-lg">{isEdit ? "Zulieferer bearbeiten" : "Neuen Zulieferer anlegen"}</h1>}
            formId="supplier-form"
            formClassName=""
            error={
                (errorCreatingSupplier || errorUpdateingSupplier) ? (
                    <p className="text-sm text-(--destructive) mb-2">
                        {errorCreatingSupplier?.message || errorUpdateingSupplier?.message}
                    </p>
                ) : null
            }
        >
            <div className="flex items-center gap-2">
                <supplierForm.Field name="name" children={(field) => (
                    <FieldInput field={field} label="Name"/>
                )} />

                <supplierForm.Field name="supplierId" children={(field) => (
                    <FieldInput field={field} label="id"/>
                )} />
            </div>
        </FormModal>
    )
}
