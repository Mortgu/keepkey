import { z } from 'zod';
import type { Supplier } from "@keepit/schemas";
import { Button, FieldInput, ModalDialog } from "@/components";
import useSupplierForm from "../-hooks/use-supplier-form";
import { useTranslation } from 'react-i18next';

interface Props {
    onClose: () => void;
    currentSupplier?: Supplier | null;
}

const supplierSchema = z.object({
    name: z.string().min(1, "Required!"),
    supplierId: z.string(),
})

export default function SupplierModal({ onClose, currentSupplier }: Props) {
    const { t } = useTranslation();
    const { form, formId, handleSubmit } = useSupplierForm({ currentSupplier: currentSupplier, closeFn: onClose });

    return (
        <ModalDialog onClose={onClose}>
            <ModalDialog.Header>
                <h1 className='text-lg'>
                    {currentSupplier && "Update Supplier"}
                    {!currentSupplier && "Create Supplier"}
                </h1>
            </ModalDialog.Header>
            <ModalDialog.Content>
                <form id={formId} onSubmit={handleSubmit}>
                    <div className="flex items-center gap-2">
                        <form.Field name="name" children={(field) => (
                            <FieldInput field={field} label="Name" />
                        )} />

                        <form.Field name="supplierId" children={(field) => (
                            <FieldInput field={field} label="id" />
                        )} />
                    </div>
                </form>
            </ModalDialog.Content>

            <ModalDialog.Footer>
                <Button onClick={onClose} type="button" size="sm" variant="border">
                    {t("button.cancel")}
                </Button>
                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                    <Button type="submit" form={formId} size="sm" disabled={!canSubmit} loading={isSubmitting}>
                        {t("button.save")}
                    </Button>
                )} />
            </ModalDialog.Footer>
        </ModalDialog>
    )
}
