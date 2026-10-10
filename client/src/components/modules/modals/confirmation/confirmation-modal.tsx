import { Button, Dialog, Input, NumberField } from "@/components";
import { getFormError } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import type { SyntheticEvent } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const confirmationSchema = z.object({
    confirmationId: z.string().min(1, "Required!"),
    date: z.string(),
    taxRate: z.number(),
});

export type ConfirmationSubmitType = z.infer<typeof confirmationSchema>;

interface Props {
    data: ConfirmationSubmitType | null;
    onClose: () => void;
    onSubmit: (values: ConfirmationSubmitType) => Promise<void>;
}

export default function ConfirmationModal({ data, onClose, onSubmit }: Props) {
    const { t } = useTranslation();
    const isEdit = data !== null;

    const form = useForm({
        defaultValues: {
            confirmationId: data?.confirmationId ?? "",
            date: data?.date ?? "",
            taxRate: data?.taxRate ?? 0
        },
        validators: {
            onChange: confirmationSchema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit({
                confirmationId: value.confirmationId.trim(),
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
                title={isEdit ? t("orders.confirmation.title") : t("orders.confirmation.create")}
                description={isEdit ? "" : t("orders.confirmation.hint")}
            />
            <Dialog.Body>
                <form onSubmit={handleSubmit} className="grid items-end gap-4">
                    <form.Field name="confirmationId" children={(field) => (
                        <Input
                            prefix="AB"
                            label={t("orders.confirmation.number")}
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
                            label={t("orders.confirmation.date")}
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
