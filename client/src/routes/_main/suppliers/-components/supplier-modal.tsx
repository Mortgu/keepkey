import { z } from 'zod';
import { useTranslation } from "react-i18next";
import useSupplierForm from "../-hooks/use-supplier-form";
import type { Supplier } from "@keepit/schemas";
import { Button, Dialog, FieldInput } from "@/components";

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
        <Dialog
            defaultOpen
            onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}
        >
            <Dialog.Header title={currentSupplier ? "Update Supplier" : "Create Supplier"} />
            <Dialog.Body>
                <form id={formId} onSubmit={handleSubmit} className="grid gap-4">
                    <div className="flex items-center gap-2">
                        <form.Field name="name" children={(field) => (
                            <FieldInput field={field} label="Name" />
                        )} />

                        <form.Field name="supplierId" children={(field) => (
                            <FieldInput field={field} label="id" />
                        )} />
                    </div>
                </form>
            </Dialog.Body>
            <Dialog.Footer>
                <Dialog.Close render={<Button variant="border" size="sm">{t("button.cancel")}</Button>} />
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Button
                            type="submit"
                            form={formId}
                            size="sm"
                            disabled={!canSubmit}
                            loading={isSubmitting}
                        >
                            {t("button.save")}
                        </Button>
                    )}
                />
            </Dialog.Footer>
        </Dialog>
    )
}
