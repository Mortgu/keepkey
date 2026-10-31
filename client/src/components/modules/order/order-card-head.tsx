import { Badge, Button } from "@/components/elements";
import { useFormatters, useGenerateOrderDocument, useLocale, useModal } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import type { Order } from "@keepit/schemas";
import { Dot } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
    order: Order;
};

export default function OrderCardHead({ order }: Props) {
    const { t } = useTranslation();
    const locale = useLocale();

    const { formatDate } = useFormatters();
    const orderModal = useModal();

    const locked = Boolean(order.acceptedAt);
    const { generateOrderDocument, isGeneratingDocument } = useGenerateOrderDocument();

    const [openAccordionSection, setOpenAccordionSection] = useState<Array<string>>([]);

    const handleGenerateOrderDocument = async () => {
        await generateOrderDocument({ orderId: order.id });

        setOpenAccordionSection((sections) => sections.includes("documents") ? sections : [...sections, 'documents']);
    }

    return (
        <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center justify-start gap-4">
                <div className="grid gap-0.5">
                    <div className="flex items-center gap-2">
                        <h1 className="font-medium">{t('flows.station.offer.label')}</h1>
                        <Badge variant="GENERATED">{localized(order.contract.translations, locale, "name")}</Badge>
                    </div>

                    <div className="flex items-center justify-start text-(--fg-3) text-sm">
                        <p className="font-mono">BE{order.orderId}</p>
                        <Dot size={14} />
                        <p className="">{formatDate(order.createdAt)}</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            {!locked && (
                <div className="flex items-center gap-2">
                    <Button
                        size="xs"
                        variant="primary"
                        onClick={handleGenerateOrderDocument}
                    >
                        {t("flows.detail.generateDocument")}
                    </Button>

                    <Button
                        size="xs"
                        variant="border"
                        onClick={() => orderModal.open()}
                    >
                        {t("button.edit")}
                    </Button>
                </div>
            )}
        </div>
    );
}