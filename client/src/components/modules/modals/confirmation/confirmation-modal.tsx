import { Button, Dialog, Input, NumberField } from "@/components";
import { getFormError } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import type { SyntheticEvent } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

interface Props {
    onClose: () => void;
}

const confirmationSchema = z.object({
    confirmationId: z.string().min(1, "Required!"),
    date: z.string(),
    vat: z.number(),
})

export default function ConfirmationModal({ onClose }: Props) {
    const { t } = useTranslation();

    const form = useForm({
        defaultValues: {
            confirmationId: "",
            date: "",
            vat: 0
        },
        validators: {
            onChange: confirmationSchema,
        },
        onSubmit: async ({ value }) => {

        }
    });

    const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();

        form.handleSubmit();
    }

    return (
        <Dialog defaultOpen onOpenChange={(np) => { if (!np) onClose(); }}>
            <Dialog.Header title="Auftragsbestätigung erstellen" description="" />
            <Dialog.Body>
                <form onSubmit={handleSubmit} className="grid items-end gap-4">
                    <form.Field name="confirmationId" children={(field) => (
                        <Input
                            prefix="AB"
                            label={t("orders.confirmation.number")}
                            value={field.state.value}
                            error={getFormError(field.state.meta.errors)}
                            onChange={(e) => field.handleChange(e.target.value)}
                        />
                    )} />

                    <form.Field name="date" children={(field) => (
                        <Input
                            type="date"
                            value={field.state.value}
                            label={t("orders.confirmation.date")}
                            error={getFormError(field.state.meta.errors)}
                            onChange={(e) => field.handleChange(e.target.value)}
                        />
                    )} />

                    <form.Field name="vat" children={(field) => (
                        <NumberField
                            label={t("orders.vat.rate")}
                            min={0}
                            max={100}
                            step={0.1}
                            suffix="%"
                            value={field.state.value}
                            error={getFormError(field.state.meta.errors)}
                            onChange={(e) => field.handleChange(e.target.value)}
                        />
                    )} />

                    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                        <Button size="sm" type="submit" disabled={!canSubmit} loading={isSubmitting}>
                            {t("button.create")}
                        </Button>
                    )} />
                </form>
            </Dialog.Body>
        </Dialog>
    )
}