import { useTranslation } from "react-i18next";
import type { DerivedFormApi } from "../hook/use-derived-form";
import { Input } from "@/components";
import { getFormError } from "@/lib/utils";
import { useQuoteIdCheck } from "@/routes/_main/offers/-hooks/use-quote-check";

interface Props {
    form: DerivedFormApi;
    /** Der Vorschlag für die neue Belegnummer wird gerade geholt. */
    isLoadingQuoteId?: boolean;
    /** false = NextCloud war beim Vorschlagen nicht erreichbar. */
    quoteIdCloudChecked?: boolean;
}

export default function OfferDerivedModal({ form, isLoadingQuoteId, quoteIdCloudChecked = true }: Props) {
    const { t } = useTranslation();

    const {
        quoteIdConflict,
        quoteIdCloudChecked: checkedOnBlur,
        checkingQuoteId,
        checkQuoteId,
        clearQuoteIdWarning,
    } = useQuoteIdCheck();

    const quoteIdWarning =
        quoteIdConflict === "db" ? t("offerModal.quoteIdTaken")
            : quoteIdConflict === "cloud" ? t("offerModal.quoteIdCloudConflict")
                : (!quoteIdCloudChecked || !checkedOnBlur) ? t("offerModal.quoteIdCloudUnavailable")
                    : undefined;

    return (
        <div className="flex items-end gap-4 mt-4">
            <form.Field name="quoteId" children={(field) => (
                <Input label="AG-Nummer" value={field.state.value}
                    loading={isLoadingQuoteId || checkingQuoteId}
                    onChange={(e) => {
                        clearQuoteIdWarning();
                        field.handleChange(e.target.value);
                    }}
                    onBlur={() => {
                        field.handleBlur();
                        void checkQuoteId(field.state.value);
                    }}
                    error={getFormError(field.state.meta.errors)}
                    warning={quoteIdWarning} />
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
