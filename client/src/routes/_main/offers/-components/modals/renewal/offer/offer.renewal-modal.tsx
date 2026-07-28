import { useTranslation } from "react-i18next";
import type { RenewalFormApi } from "../hook/use-renewal-form";
import { Input } from "@/components";

interface Props {
    form: RenewalFormApi;
}

export default function OfferRenewalModal({ form }: Props) {
    const { t } = useTranslation();

    return (
        <div className="flex items-end gap-4 mt-4">
            <form.Field name="quoteId" children={(field) => (
                <Input label="AG-Nummer" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            )} />

            <form.Field name="startDate" children={(field) => (
                <Input label={t("renewal.start_date")} type="date" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            )} />

            <form.Field name="validUntil" children={(field) => (
                <Input label={t("renewal.valid_until")} type="date" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            )} />
        </div>
    );
}