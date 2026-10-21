import {   createSupplierSchema } from "@keepit/schemas";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import type {CreateSupplierInput, Supplier} from "@keepit/schemas";
import type { SyntheticEvent } from "react";
import type { TranslationKey } from "@/i18n";
import { useCreateSupplier, useUpdateSupplier } from "@/hooks";

/* Das geteilte Schema meldet einen leeren Namen mit einem festen englischen Text
   ("Required!"), den auch der Server nutzt. Im Formular gilt dieselbe Regel,
   nur mit Übersetzungsschlüssel — aufgelöst wird er bei der Anzeige. */
const supplierFormSchema = createSupplierSchema.extend({
    name: z.string().nonempty("validation.required" satisfies TranslationKey),
});

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
            onMount: supplierFormSchema,
            onChange: supplierFormSchema,
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