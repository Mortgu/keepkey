import {   createSupplierSchema } from "@keepit/schemas";
import { useForm } from "@tanstack/react-form";
import type {CreateSupplierInput, Supplier} from "@keepit/schemas";
import type { SyntheticEvent } from "react";
import { useCreateSupplier, useUpdateSupplier } from "@/hooks";

interface Props {
    currentSupplier?: Supplier | null;
    onClose: () => void;
}

export default function useSupplierForm({ currentSupplier, onClose }: Props) {
    const { createSupplier } = useCreateSupplier();
    const { updateSupplier } = useUpdateSupplier();

    const formId = "supplier-form";

    const defaultValues: CreateSupplierInput = {
        name: currentSupplier?.name ?? '',
        supplierId: currentSupplier?.supplierId,
    }

    const form = useForm({
        defaultValues: defaultValues,
        validators: {
            onMount: createSupplierSchema,
            onChange: createSupplierSchema,
        },
        onSubmit: ({ value }) => {
            if (currentSupplier) {
                updateSupplier({ id: currentSupplier.id, supplier: value });
            } else {
                createSupplier({ ...value });
            }

            onClose();
        }
    });

    const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();

        form.handleSubmit();
    }

    return { form, formId, handleSubmit };
}

export type SupplierFormApi = ReturnType<typeof useSupplierForm>['form'];