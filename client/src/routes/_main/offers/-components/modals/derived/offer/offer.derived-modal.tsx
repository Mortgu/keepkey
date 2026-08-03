import { useTranslation } from "react-i18next";
import type { DerivedFormApi } from "../hook/use-derived-form";
import { Input } from "@/components";
import { getFormError } from "@/lib/utils";

interface Props {
    form: DerivedFormApi;
}

export default function OfferDerivedModal({ form }: Props) {
    const { t } = useTranslation();

    return (
        <div className="flex items-end gap-4 mt-4">
            <form.Field name="quoteId" children={(field) => (
                <Input label="AG-Nummer" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            )} />

            <form.Field name="requestFrom" children={(field) => (
                <Input label={t("offerModal.requestFrom")} type="date" value={field.state.value?.split("T")[0] ?? ""}
                    error={getFormError(field.state.meta.errors)}
                    onBlur={field.handleBlur} onChange={(e) => {
                        const val = e.target.value;
                        if (!val) {
                            field.handleChange(null);
                            return;
                        }
                        field.handleChange(`${val}T00:00:00.000Z`);
                    }}
                />
            )} />

            <form.Field name="validUntil" children={(field) => (
                <Input label={t("offerModal.validUntil")} type="date" value={field.state.value?.split("T")[0] ?? ""}
                    error={getFormError(field.state.meta.errors)}
                    onBlur={field.handleBlur} onChange={(e) => {
                        const val = e.target.value;
                        if (!val) {
                            field.handleChange(null);
                            return;
                        }
                        field.handleChange(`${val}T00:00:00.000Z`);
                    }}
                />
            )} />
        </div>
    );
}