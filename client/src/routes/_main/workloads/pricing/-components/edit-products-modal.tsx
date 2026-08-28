import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import type { Product } from "@keepit/schemas";
import type {DropdownOption} from "@/components";
import {
    
    FormDialog,
    MultiSelectList
} from "@/components";
import { getFormError } from "@/lib/utils";
import { useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";

interface EditProductsModalProps {
    onClose: () => void;
    submitFn: (productIds: Array<string>) => void;
    products: Array<Product>;
    selectedProductIds: Array<string>;
    loading?: boolean;
}

const editProductsSchema = z.object({
    products: z.array(z.string().min(1)).min(1, "Mindestens 1 Produkt muss zugeordnet sein"),
});

export default function EditProductsModal({
    onClose,
    submitFn,
    products,
    selectedProductIds,
    loading,
}: EditProductsModalProps) {
    const locale = useLocale();

    const options: Array<DropdownOption> = products.map(p => ({
        value: p.id,
        label: localized(p.translations, locale, "name") || p.id,
    }));

    const form = useForm({
        defaultValues: {
            products: selectedProductIds,
        },
        validators: {
            onChange: editProductsSchema,
            onMount: editProductsSchema,
        },
        onSubmit: ({ value }) => {
            submitFn(value.products);
            onClose();
        },
    });


    return (
        <FormDialog
            form={form}
            defaultOpen
            onClose={onClose}
            formId="edit-products-form"
            title="Produkte bearbeiten"
            submitLoading={loading}
        >
            <form.Field name="products" children={(field) => (
                        <div className="grid gap-1">
                            <label className="text-sm text-gray-500">Produkte</label>
                            <MultiSelectList
                                options={options}
                                values={field.state.value}
                                onChange={field.handleChange}
                            />
                            {getFormError(field.state.meta.errors) && (
                                <p className="text-sm text-red-500">
                                    {getFormError(field.state.meta.errors)}
                                </p>
                            )}
                        </div>
            )} />
        </FormDialog>
    );
}
