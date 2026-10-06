import { useTranslation } from "react-i18next";
import PurchasePriceTable from "../purchase-price-table";
import type useOrderModal from "../../-hooks/use-order-modal";
import type { Offer } from "@keepit/schemas";
import { Badge, Input, Textarea } from "@/components";
import { useLocale, useSuppliers } from "@/hooks";
import { getErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { localized } from "@/lib/i18n-content";
import { getFormError } from "@/lib/utils";
import { formatEur } from "@/utils/utils";

type Modal = ReturnType<typeof useOrderModal>;

interface Props {
    offer: Offer;
    form: Modal["form"];
    rows: Modal["rows"];
    error: unknown;
    formId: string;
}

/**
 * Rechte Spalte: das gewählte Angebot zum Abgleich, darunter die Einkaufspreise
 * (bearbeitbar) und die Bestelldaten. Das `<form>` liegt hier, der Submit-Button
 * im Dialog-Footer verweist per `form`-Attribut darauf.
 */
export default function OrderModalDetail({ offer, form, rows, error, formId }: Props) {
    const { t } = useTranslation();
    const locale = useLocale();
    const { suppliers } = useSuppliers();
    const supplier = suppliers.find((s) => s.id === offer.supplierId);
    const ccp = offer.customerContactPerson;

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
    };

    return (
        <div className="overflow-y-auto h-full bg-(--page-bg) p-4 grid gap-4 content-start">
            {/* Angebot */}
            <section className="bg-white border border-(--border) rounded-md">
                <div className="flex items-start justify-between gap-4 p-4">
                    <div className="grid gap-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-(--text-secondary)">AG{offer.quoteId}</span>
                            {offer.derivationType === "RENEWAL" && <Badge variant="GENERATED" size="xs">{t("derived.badge_renewal")}</Badge>}
                            {offer.derivationType === "LICENSE_EXTENSION" && <Badge variant="GENERATED" size="xs">{t("derived.badge_extension")}</Badge>}
                        </div>
                        <p className="text-md font-semibold truncate">{offer.customer.companyName}</p>
                        <p className="text-sm text-(--text-secondary)">{ccp.salutation} {ccp.firstName} {ccp.lastName}</p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="font-mono font-medium">{formatEur(offer.net_amount)}</p>
                        <p className="text-xs text-(--text-secondary)">{t("orders.modal.netTotal")}</p>
                    </div>
                </div>
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 px-4 pb-4 text-sm">
                    <div>
                        <dt className="text-xs uppercase tracking-wide text-(--text-secondary)">{t("orders.modal.offerDate")}</dt>
                        <dd>{formatDate(offer.date)}</dd>
                    </div>
                    <div>
                        <dt className="text-xs uppercase tracking-wide text-(--text-secondary)">{t("orders.modal.validUntil")}</dt>
                        <dd>{offer.validUntil ? formatDate(offer.validUntil) : "—"}</dd>
                    </div>
                    <div>
                        <dt className="text-xs uppercase tracking-wide text-(--text-secondary)">{t("orders.modal.supplier")}</dt>
                        <dd>{supplier?.name ?? "—"}</dd>
                    </div>
                    <div>
                        <dt className="text-xs uppercase tracking-wide text-(--text-secondary)">{t("orders.modal.contract")}</dt>
                        <dd>{localized(offer.contract.translations, locale, "name")} · {offer.duration_months} {t("renewal.months")}</dd>
                    </div>
                </dl>
            </section>

            <form id={formId} onSubmit={submit} className="grid gap-4">
                {error != null && <p role="alert" className="text-sm text-(--destructive)">{getErrorMessage(error)}</p>}

                {/* Einkaufsseite */}
                <section className="bg-white border border-(--border) rounded-md p-4">
                    <form.Field name="positions" children={(field) => (
                        <PurchasePriceTable
                            rows={rows}
                            values={field.state.value}
                            onChange={(offerPositionId, purchaseCents) => field.handleChange(
                                field.state.value.map((p) => p.offerPositionId === offerPositionId
                                    ? { ...p, purchase_eur_user_month: purchaseCents }
                                    : p),
                            )}
                        />
                    )} />
                </section>

                {/* Bestelldaten */}
                <section className="bg-white border border-(--border) rounded-md p-4 grid gap-4">
                    <p className="text-sm font-medium">{t("orders.modal.orderData")}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <form.Field name="orderId" children={(field) => (
                            <Input
                                id={`${formId}-orderId`}
                                label={t("orders.number")}
                                prefix="BE"
                                value={field.state.value}
                                error={getFormError(field.state.meta.errors)}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                            />
                        )} />
                        <form.Field name="projectNumber" children={(field) => (
                            <Input
                                id={`${formId}-projectNumber`}
                                label={t("orders.projectNumber")}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                            />
                        )} />
                        <form.Field name="date" children={(field) => (
                            <Input
                                id={`${formId}-date`}
                                type="date"
                                label={t("orders.date")}
                                value={field.state.value}
                                error={getFormError(field.state.meta.errors)}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                            />
                        )} />
                        <form.Field name="contractStartDate" children={(field) => (
                            <Input
                                id={`${formId}-contractStartDate`}
                                type="date"
                                label={t("orders.contractStartDate")}
                                value={field.state.value}
                                error={getFormError(field.state.meta.errors)}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                            />
                        )} />
                    </div>
                    <form.Field name="projectDescription" children={(field) => (
                        <Textarea
                            id={`${formId}-projectDescription`}
                            label={t("orders.projectDescription")}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                        />
                    )} />
                    <form.Field name="orderDetails" children={(field) => (
                        <Textarea
                            id={`${formId}-orderDetails`}
                            label={t("orders.details")}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                        />
                    )} />
                </section>
            </form>
        </div>
    );
}
