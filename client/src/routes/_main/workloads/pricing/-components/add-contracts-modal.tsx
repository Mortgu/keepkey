import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useForm } from "@tanstack/react-form";
import type { Contract } from "@keepit/schemas";
import type {DropdownOption} from "@/components";
import {
    Button,
    Dialog,
    MultiSelectList,
} from "@/components";
import { getFormError } from "@/lib/utils";
import { useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";

interface AddContractsModalProps {
    onClose: () => void;
    submitFn: (contractIds: Array<string>) => void;
    contracts: Array<Contract>;
    excludeContractIds: Set<string>;
    loading?: boolean;
}

const addContractsSchema = z.object({
    contracts: z.array(z.string().min(1)).min(1, "Mindestens 1 Vertrag auswählen"),
});

export default function AddContractsModal({
    onClose,
    submitFn,
    contracts,
    excludeContractIds,
    loading,
}: AddContractsModalProps) {
    const { t } = useTranslation();
    const locale = useLocale();

    const options: Array<DropdownOption> = contracts
        .filter(c => !excludeContractIds.has(c.id))
        .map(c => ({
            value: c.id,
            label: localized(c.translations, locale, "name") || c.id,
        }));

    const form = useForm({
        defaultValues: {
            contracts: [] as Array<string>,
        },
        validators: {
            onChange: addContractsSchema,
            onMount: addContractsSchema,
        },
        onSubmit: ({ value }) => {
            submitFn(value.contracts);
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
            <Dialog.Header title="Verträge hinzufügen" />
            <Dialog.Body>
                <form id="add-contracts-form" onSubmit={handleSubmit} className="grid gap-4">
                    <form.Field name="contracts" children={(field) => (
                        <div className="grid gap-1">
                            <label className="text-sm text-gray-500">Verträge</label>
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
                                    Alle Verträge sind bereits dieser Preistabelle zugeordnet.
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
                            form="add-contracts-form"
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
