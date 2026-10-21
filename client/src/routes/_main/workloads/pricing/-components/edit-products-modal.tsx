import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useForm } from "@tanstack/react-form";
import type { Product } from "@keepit/schemas";
import type {DropdownOption} from "@/components";
import type { TranslationKey } from "@/i18n";
import {
    Button,
    Dialog,
    MultiSelectList,
} from "@/components";
import { useFormError, useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";

interface EditProductsModalProps {
    onClose: () => void;
    submitFn: (productIds: Array<string>) => void;
    products: Array<Product>;
    selectedProductIds: Array<string>;
    loading?: boolean;
}

const editProductsSchema = z.object({
    products: z.array(z.string().min(1)).min(1, "workloads.validation.productsAssigned" satisfies TranslationKey),
});

export default function EditProductsModal({
    onClose,
    submitFn,
    products,
    selectedProductIds,
    loading,
}: EditProductsModalProps) {
    const { t } = useTranslation();
    const locale = useLocale();
    const formError = useFormError();

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


    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {


        e.preventDefault();


        e.stopPropagation();


        form.handleSubmit();


    };



    return (
        <Dialog
            defaultOpen
            onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}
        >
            <Dialog.Header title={t("workloads.pricing.editProducts.title")} />
            <Dialog.Body>
                <form id="edit-products-form" onSubmit={handleSubmit} className="grid gap-4">
                    <form.Field name="products" children={(field) => (
                        <div className="grid gap-1">
                            <label className="text-sm text-gray-500">{t("workloads.pricing.products")}</label>
                            <MultiSelectList
                                options={options}
                                values={field.state.value}
                                onChange={field.handleChange}
                            />
                            {formError(field.state.meta.errors) && (
                                <p className="text-sm text-red-500">
                                    {formError(field.state.meta.errors)}
                                </p>
                            )}
                        </div>
                    )} />
                </form>
            </Dialog.Body>
            <Dialog.Footer>
                <Dialog.Close render={<Button variant="border" size="sm">{t("button.cancel")}</Button>} />
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Button
                            type="submit"
                            form="edit-products-form"
                            size="sm"
                            disabled={!canSubmit}
                            loading={loading ?? isSubmitting}
                        >
                            {t("button.save")}
                        </Button>
                    )}
                />
            </Dialog.Footer>
        </Dialog>
    );
}
