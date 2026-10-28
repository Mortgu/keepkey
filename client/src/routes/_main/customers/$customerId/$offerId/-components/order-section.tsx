import { Accordion, Badge } from "@/components";
import { useFormatters, useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import type { Order } from "@keepit/schemas";
import { Dot } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
    order: Order | undefined | null;
};

export default function OfferSection({ order }: Props) {
    if (!order) return <>dwa</>
    const { t } = useTranslation();
    const locale = useLocale();

    const { formatDate, formatEur } = useFormatters();

    console.log(order);

    return (
        <div className="border border-(--border) rounded-md data-[accepted=true]" data-accepted={Boolean(order.acceptedAt)}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center justify-start gap-4">
                    <div className="grid gap-0.5">
                        <div className="flex items-center gap-2">
                            <h1 className="font-medium">{t('flows.station.order.label')}</h1>
                            <Badge variant="GENERATED">{localized(order.offer.contract.translations, locale, 'name')}</Badge>
                        </div>

                        <div className="flex items-center justify-start text-(--fg-3) text-sm">
                            <p className="font-mono">BE{order.orderId}</p>
                            <Dot size={14} />
                            <p className="">{formatDate(order.date)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products / Workloads */}
            <Accordion defaultValue={['Workloads']}>
                <Accordion.Section value="workloads" label="Workloads">
                    <div className="border-t border-(--border)">
                        <div className="grid items-center grid-cols-[1fr_1fr_1fr_1fr] bg-gray-100 border-b border-(--border) uppercase text-xs font-medium">
                            <p className="px-4 py-1.5 border-r border-(--border)">Produkt</p>
                            <p className="px-4 py-1.5 border-r border-(--border)">Seats</p>
                            <p className="px-4 py-1.5 border-r border-(--border)">Stückpreis</p>
                            <p className="px-4 py-1.5 text-right">total</p>
                        </div>

                        {/* Workload */}
                        {order.positions.map((position) => (
                            <div className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center justify-between border-b border-(--border) last:border-b-0 text-sm">
                                <p className="px-4 py-3">{}</p>
                                <p className="px-4 py-3">0 Stk.</p>
                                <p className="px-4 py-3">{formatEur(0)}</p>
                                <p className="px-4 py-3 text-right">{formatEur(0)}</p>
                            </div>
                        ))}
                    </div>
                </Accordion.Section>

                <Accordion.Section value="documents" label={t("flows.detail.documents")}>
                    <div className="border-t border-(--border)">
                        {/* Workload */}
                        {order.documents.map((document) => (
                            <>{JSON.stringify(document)}</>
                        ))}
                    </div>
                </Accordion.Section>
            </Accordion>

            
        </div>
    )
}