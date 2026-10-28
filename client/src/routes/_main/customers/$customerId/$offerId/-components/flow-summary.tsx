import { useFormatters, useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { vatTotals, type Customer, type Offer } from "@keepit/schemas";
import { useTranslation } from "react-i18next";

type Props = {
    offer: Offer;
    customer: Customer;
};

export default function FlowSummary({ offer, customer }: Props) {
    const { t } = useTranslation();
    const locale = useLocale();

    const { formatEur } = useFormatters();
    const preview = vatTotals(offer.net_amount, customer?.taxRate ?? 0);

    const rows: Array<[string, string]> = [
        [t("flows.summary.customer"), offer.customer.companyName],
        [t("flows.summary.contact"), `${offer.customerContactPerson.firstName} ${offer.customerContactPerson.lastName}`.trim()],
        [t("flows.summary.duration"), t("flows.summary.durationMonths", { count: offer.duration_months })],
        [t("flows.summary.paymentTerm"), offer.paymentTerm],
    ];

    return (
        <aside className="grid gap-4 lg:sticky lg:top-4">
            <section className="rounded-md border border-(--border) bg-white">
                <h2 className="border-b border-(--border) px-4 py-3 text-[14px] font-medium">{t("flows.summary.title")}</h2>

                <dl className="grid gap-2 px-4 py-3 text-[13px]">
                    {rows.map(([term, value]) => (
                        <div key={term} className="flex justify-between gap-3">
                            <dt className="text-(--fg-3)">{term}</dt>
                            <dd className="text-right">{value}</dd>
                        </div>
                    ))}
                </dl>

                <dl className="grid gap-1.5 border-t border-(--border) px-4 py-3 text-[13px] tabular-nums">
                    {offer.offerPositions.map((position) => (
                        <div className="flex justify-between">
                            <dt className="text-(--fg-3)">{localized(position.product.translations, locale, "name")}</dt>
                            <dd>{formatEur(position.total_cents)}</dd>
                        </div>
                    ))}
                </dl>

                <dl className="grid gap-1.5 border-t border-(--border) px-4 py-3 text-[13px] tabular-nums">
                    <div className="flex justify-between"><dt className="text-(--fg-3)">{t("flows.summary.net")}</dt><dd>{formatEur(offer.net_amount)}</dd></div>
                    <div className="flex justify-between">
                        <dt className="text-(--fg-3)">{t("flows.summary.vat")} ({customer?.taxRate}%)</dt><dd>{formatEur(preview.vatCents)}</dd>
                    </div>
                    <div className="flex justify-between text-[15px] font-medium">
                        <dt>{t("flows.summary.gross")}</dt><dd>{formatEur(preview.grossCents)}</dd>
                    </div>
                </dl>
            </section>
        </aside>
    )
}