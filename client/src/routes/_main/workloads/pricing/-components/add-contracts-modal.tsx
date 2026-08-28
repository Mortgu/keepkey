import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import type { Contract } from "@keepit/schemas";
import type {DropdownOption} from "@/components";
import {
    
    FormDialog,
    MultiSelectList
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


    return (
        <FormDialog
            form={form}
            defaultOpen
            onClose={onClose}
            formId="add-contracts-form"
            title="Verträge hinzufügen"
            submitDisabled={options.length === 0}
            submitLoading={loading}
        >
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
        </FormDialog>
    );
}
