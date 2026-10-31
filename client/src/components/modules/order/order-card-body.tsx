import { localized } from "@/lib/i18n-content";
import DocumentCard from "@/routes/_main/-components/card/document-card";
import { Accordion } from "@/components";

import type { Dispatch, SetStateAction } from "react";
import type { OrderDocument, OrderPosition } from "@keepit/schemas";
import { useFormatters, useLocale } from "@/hooks";
import { useTranslation } from "react-i18next";

type Props = {
    orderPositions: OrderPosition[];
    orderDocuments: OrderDocument[];

    locked: boolean;
    orderId: string;

    openAccordionSection: string[];
    setOpenAccordionSection: Dispatch<SetStateAction<string[]>>;
};

export default function OrderCardBody(props: Props) {
    const {
        orderPositions,
        orderDocuments,

        locked,
        orderId,

        openAccordionSection,
        setOpenAccordionSection
    } = props;

    const { t } = useTranslation();
    const locale = useLocale();

    const { formatDate, formatEur } = useFormatters();

    return (
        <Accordion value={openAccordionSection} onValueChange={setOpenAccordionSection} >
            <Accordion.Section value="workloads" label="Workloads">
                <div className="border-t border-(--border)">
                    <div className="grid items-center grid-cols-[1fr_1fr_1fr_1fr] bg-gray-100 border-b border-(--border) uppercase text-xs font-medium">
                        <p className="px-4 py-1.5 border-r border-(--border)">Produkt</p>
                        <p className="px-4 py-1.5 border-r border-(--border)">Seats</p>
                        <p className="px-4 py-1.5 border-r border-(--border)">Stückpreis</p>
                        <p className="px-4 py-1.5 text-right">total</p>
                    </div>

                    {/* Workload */}
                    {orderPositions.map((position) => (
                        <div className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center justify-between border-b border-(--border) last:border-b-0 text-sm">
                            <p className="px-4 py-3">{localized(position.product.translations, locale, 'name')}</p>
                            <p className="px-4 py-3">{position.quantity} Stk.</p>
                            <p className="px-4 py-3">{formatEur(position.total_cents)}</p>
                            <p className="px-4 py-3 text-right">{formatEur(position.total_cents)}</p>
                        </div>
                    ))}
                </div>
            </Accordion.Section>

            <Accordion.Section value="documents" label={t("flows.detail.documents")}>
                <div className="px-4 border-t border-(--border)">
                    {/* Workload */}
                    {orderDocuments.map((document) => (
                        <DocumentCard
                            key={document.id}
                            type="offer"
                            document={document}
                            parentId={orderId}
                            locked={locked}
                        />
                    ))}

                    {orderDocuments.length === 0 && (
                        <div className="flex items-center justify-center py-4">
                            <p className="text-sm text-(--text-secondary)">{t('orders.documents.not_generated')}</p>
                        </div>
                    )}
                </div>
            </Accordion.Section>
        </Accordion >
    )
}