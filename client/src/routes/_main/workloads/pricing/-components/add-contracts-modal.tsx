import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import type { Contract } from "@/types";
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
        <ModalDialog onClose={onClose}>
            <ModalDialog.Header>
                <h1 className="text-lg">Verträge hinzufügen</h1>
            </ModalDialog.Header>

            <ModalDialog.Content>
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
            </ModalDialog.Content>

            <ModalDialog.Footer>
                <Button onClick={onClose} type="button" size="sm" variant="border">
                    {t("button.cancel")}
                </Button>
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Button
                            form="add-contracts-form"
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
