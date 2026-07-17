import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import type { CreateTariffGroupInput, Product } from "@/types";
import type { DropdownOption } from "@/components/filters/multi-dropdown";
import {
    Button,
    ModalDialog,
    MultiSelectList,
} from "@/components";
import { getFormError } from "@/lib/utils";
import { useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { useTranslation } from "react-i18next";

interface TariffGroupModalProps {
    onClose: () => void;
    submitFn: (value: CreateTariffGroupInput) => void;
    products: Array<Product>;
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
        <ModalDialog onClose={onClose}>
            <ModalDialog.Header>
                <h1 className="text-lg">Neue Preistabelle</h1>
            </ModalDialog.Header>

            <ModalDialog.Content>
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
            </ModalDialog.Content>

            <ModalDialog.Footer>
                <Button onClick={onClose} type="button" size="sm" variant="border">
                    {t("button.cancel")}
                </Button>
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Button
                            form="tariff-group-form"
                            disabled={!canSubmit || options.length === 0}
                            type="submit"
                            size="sm"
                            loading={loading ?? isSubmitting}
                        >
                            {t("button.save")}
                        </Button>
                    )}
                />
            </ModalDialog.Footer>
        </ModalDialog>
    );
}
