import { Input, Button } from "@/components";
import { usePrice } from "@/hooks";
import type { OfferPosition } from "@keepit/schemas";
import type { SyntheticEvent } from "react";
import { useTranslation } from "react-i18next";
import type { RenewalWorkloadFormApi } from "../hook/use-renwal-workload-form";

interface Props {
    customerId: string;
    workload: OfferPosition;
    form: RenewalWorkloadFormApi;
};

export default function WorkloadItemFormRenwalModal({ customerId, workload, form }: Props) {
    const { t } = useTranslation();

    const { price, isPending: pricePending } = usePrice(customerId, workload);

    const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();

        form.handleSubmit();
    }

    return (
        <div>
            <form id="renewal-workload-form" onSubmit={handleSubmit} className="flex items-center gap-4 bg-(--subtle-50) border-t border-(--border) p-4">
                <form.Field name="quantity" children={(field) => (
                    <Input label="Menge" value={field.state.value} onChange={(e) => {
                        const value = Number(e.target.value);
                        if (isNaN(value)) return;
                        field.handleChange(Number(e.target.value))
                    }} />
                )} />

                <form.Field name="free_months" children={(field) => (
                    <Input label="Freimonate" value={field.state.value} onChange={(e) => {
                        const value = Number(e.target.value);
                        if (isNaN(value)) return;
                        field.handleChange(Number(e.target.value))
                    }} />
                )} />
            </form>

            <div className="flex items-center justify-between border-t border-(--border) p-2">
                <div></div>
                <div className="flex items-center gap-2">
                    <Button size="xs" variant="secondary">{t("button.cancel")}</Button>
                    <form.Subscribe
                        selector={(state) => [state.canSubmit, state.isSubmitting]}
                        children={([canSubmit, isSubmitting]) => (
                            <Button form="renewal-workload-form" size="xs" variant="primary"
                                disabled={!canSubmit} loading={isSubmitting}>{t("button.save")}</Button>
                        )} />
                </div>
            </div>
        </div>
    )
}