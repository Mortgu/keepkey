import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useForm } from "@tanstack/react-form";
import type { CreateTariffGroupInput,
    ProductList
 } from "@keepit/schemas";
import type {DropdownOption} from "@/components";
import {
    Button,
    Dialog,
    MultiSelectList,
} from "@/components";
import { getFormError } from "@/lib/utils";
import { useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";


interface TariffGroupModalProps {
    onClose: () => void;
    submitFn: (value: CreateTariffGroupInput) => void;
    products: ProductList;
    excludeProductIds: Set<string>;
    loading?: boolean;
}

const tariffGroupSchema = z.object({
    products: z.array(z.string().min(1)).min(1, "Mindestens 1 Produkt auswählen"),
});

export default function TariffGroupModal({
    onClose,
    submitFn,
    products,
    excludeProductIds,
    loading,
}: TariffGroupModalProps) {
    const { t } = useTranslation();
    const locale = useLocale();

    const options: Array<DropdownOption> = products
        .filter(p => !excludeProductIds.has(p.id))
        .map(p => ({
            value: p.id,
            label: localized(p.translations, locale, "name") || p.id,
        }));

    const form = useForm({
        defaultValues: {
            products: [] as Array<string>,
        },
        validators: {
            onChange: tariffGroupSchema,
            onMount: tariffGroupSchema,
        },
        onSubmit: ({ value }) => {
            submitFn({ products: value.products });
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
            <Dialog.Header title="Neue Preistabelle" />
            <Dialog.Body>
                <form id="tariff-group-form" onSubmit={handleSubmit} className="grid gap-4">
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
                            {options.length === 0 && (
                                <p className="text-sm text-(--fg-3)">
                                    Alle Produkte sind bereits einer Preistabelle zugeordnet.
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
                            form="tariff-group-form"
                            size="sm"
                            disabled={!canSubmit || options.length === 0}
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
