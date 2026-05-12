import { Button, Input, ModalDialog } from "@/components";
import { useSupplierHook } from "@/hooks";
import type { Supplier } from "@/types";
import { useForm } from "@tanstack/react-form";
import type { SyntheticEvent } from "react";
import { z } from 'zod';

interface SupplierModalProps {
    open: boolean;
    cancelFn: () => void;
    currentSupplier?: Supplier;
}

const supplierSchema = z.object({
    name: z.string().min(1, "Required!"),
    supplierId: z.string(),
})

export default function SupplierModal({ open, cancelFn, currentSupplier }: SupplierModalProps) {
    const isEdit = !!currentSupplier;

    const {
        createSupplier,
        errorCreatingSupplier,

        updateSupplier,
        errorUpdateingSupplier,
    } = useSupplierHook();

    const supplierForm = useForm({
        defaultValues: {
            name: currentSupplier?.name ?? '',
            supplierId: currentSupplier?.supplierId ?? ''
        },
        validators: {
            onChange: supplierSchema,
            onMount: supplierSchema,
        },
        onSubmit: ({ value }) => {
            if (isEdit) updateSupplier({ id: currentSupplier.id, supplier: value })
            else createSupplier(value);

            if (!errorCreatingSupplier && !errorUpdateingSupplier) {
                cancelFn();
            }
        }
    });

    const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        supplierForm.handleSubmit();
    }

    return (
        <ModalDialog open={open} cancelFn={cancelFn}>
            <ModalDialog.Header>
                <h1 className="text-lg">
                    {isEdit && "Zulieferer bearbeiten"}
                    {!isEdit && "Neuen Zulieferer anlegen"}
                </h1>
            </ModalDialog.Header>
            <ModalDialog.Content>
                <form id="supplier-form" onSubmit={handleSubmit}>
                    <div className="flex items-center gap-2">
                        <supplierForm.Field name="name" children={(field) => (
                            <Input label="Name" value={field.state.value} error={field.state.meta.errors[0]?.message}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur} />
                        )} />

                        <supplierForm.Field name="supplierId" children={(field) => (
                            <Input label="id" value={field.state.value} error={field.state.meta.errors[0]?.message}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur} />
                        )} />
                    </div>
                </form>
            </ModalDialog.Content>
            <ModalDialog.Footer>
                <div className="w-full flex items-center justify-between">
                    <p className="text-sm text-(--destructive)">
                        {(errorCreatingSupplier || errorUpdateingSupplier) && (
                            errorCreatingSupplier?.message || errorUpdateingSupplier?.message
                        )}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="secondary" size="sm">Abbrechen</Button>
                        <supplierForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                            <Button form="supplier-form" size="sm" type="submit" disabled={!canSubmit} loading={isSubmitting}>
                                Speichern
                            </Button>
                        )} />
                    </div>
                </div>
            </ModalDialog.Footer>
        </ModalDialog>
    )
}