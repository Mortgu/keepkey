import { Button, Dialog, Input, NumberField } from "@/components";
import { getFormError } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import type { SyntheticEvent } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const invoiceSchema = z.object({
    invoiceId: z.string().min(1, "Required!"),
    date: z.string(),
    taxRate: z.number(),
});

export type InvoiceSubmitType = z.infer<typeof invoiceSchema>;

interface Props {
    data: InvoiceSubmitType | null;
    onClose: () => void;
    onSubmit: (values: InvoiceSubmitType) => Promise<void>;
}

export default function InvoiceModal({ data, onClose, onSubmit }: Props) {
    const { t } = useTranslation();
    const isEdit = data !== null;

    const form = useForm({
        defaultValues: {
            invoiceId: data?.invoiceId ?? "",
            date: data?.date ?? "",
            taxRate: data?.taxRate ?? 0
        },
        validators: {
            onChange: invoiceSchema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit({
                invoiceId: value.invoiceId.trim(),
                date: value.date,
                taxRate: value.taxRate
            });
        }
    });

    const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();

        form.handleSubmit();
    }

    return (
        <Dialog defaultOpen onOpenChange={(np) => { if (!np) onClose(); }}>
            <Dialog.Header
                title={isEdit ? t("orders.invoice.title") : t("orders.invoice.create")}
                description={isEdit ? "" : t("orders.invoice.hint")}
            />
            <Dialog.Body>
                <form onSubmit={handleSubmit} className="grid items-end gap-4">
                    <form.Field name="invoiceId" children={(field) => (
                        <Input
                            prefix="RE"
                            label={t("orders.invoice.number")}
                            value={field.state.value}
                            error={getFormError(field.state.meta.errors)}
                            onChange={(e) => field.handleChange(e.target.value)}
                            disabled={isEdit}
                        />
                    )} />

                    <form.Field name="date" children={(field) => (
                        <Input
                            type="date"
                            value={field.state.value}
                            label={t("orders.invoice.date")}
                            error={getFormError(field.state.meta.errors)}
                            onChange={(e) => field.handleChange(e.target.value)}
                            disabled={isEdit}
                        />
                    )} />

                    <form.Field name="taxRate" children={(field) => (
                        <NumberField
                            label={t("orders.vat.rate")}
                            min={0}
                            max={100}
                            step={0.1}
                            suffix="%"
                            value={field.state.value}
                            error={getFormError(field.state.meta.errors)}
                            onValueChange={(value) => field.handleChange(value ?? 0)}
                            disabled={isEdit}
                        />
                    )} />

                    {!isEdit && (
                        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                            <Button size="sm" type="submit" disabled={!canSubmit} loading={isSubmitting}>
                                {t("button.create")}
                            </Button>
                        )} />
                    )}
                </form>
            </Dialog.Body>
        </Dialog>
    )
}
