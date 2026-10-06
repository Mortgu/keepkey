import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Order } from "@keepit/schemas";
import { Button, Input, ListSkeleton, Skeleton } from "@/components";
import { useCreateInvoice, useInvoice, useRegenerateInvoice } from "@/hooks";
import { getErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import DocumentCard from "@/routes/_main/-components/card/document-card";

interface Props {
    order: Order;
}

/**
 * Rechnung zu einer Bestellung: Solange keine existiert, ein kleines
 * Formular (Rechnungs-Nr., Datum). Danach Nummer, Datum und das Dokument. Die Nummer
 * ist nach dem Anlegen fest.
 */
export default function InvoiceSection({ order }: Props) {
    const { t } = useTranslation();
    const { invoice, isPending, error } = useInvoice(order.id);
    const { createInvoice, isCreatingInvoice, errorCreatingInvoice } = useCreateInvoice(order.id);
    const { regenerateInvoice, isRegenerating } = useRegenerateInvoice(order.id);

    const [invoiceId, setInvoiceId] = useState("");
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

    const cancelled = Boolean(order.cancelledAt);

    if (isPending) {
        return <ListSkeleton rows={1} skeleton={<Skeleton className="h-10" />} />;
    }
    if (error) {
        return <p role="alert" className="py-3 text-sm text-(--destructive)">{getErrorMessage(error)}</p>;
    }

    if (!invoice) {
        const submit = async (event: React.FormEvent) => {
            event.preventDefault();
            if (!invoiceId.trim()) return;
            try {
                await createInvoice({ invoiceId: invoiceId.trim(), date });
            } catch {
                // Fehler wird unten gerendert.
            }
        };

        return (
            <form onSubmit={submit} className="grid gap-3 py-3">
                <p className="text-sm text-(--text-secondary)">{t("orders.invoice.hint")}</p>
                {errorCreatingInvoice && (
                    <p role="alert" className="text-sm text-(--destructive)">{getErrorMessage(errorCreatingInvoice)}</p>
                )}
                <div className="flex items-end gap-4">
                    <Input
                        id={`invoice-id-${order.id}`}
                        label={t("orders.invoice.number")}
                        prefix="RE"
                        value={invoiceId}
                        onChange={(e) => setInvoiceId(e.target.value)}
                        disabled={cancelled}
                    />
                    <Input
                        id={`invoice-date-${order.id}`}
                        type="date"
                        label={t("orders.invoice.date")}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        disabled={cancelled}
                    />
                    <Button
                        type="submit"
                        size="sm"
                        loading={isCreatingInvoice}
                        disabled={cancelled || isCreatingInvoice || !invoiceId.trim()}
                    >
                        {t("orders.invoice.create")}
                    </Button>
                </div>
            </form>
        );
    }

    const busy = invoice.documents.some((d) => d.status === "PENDING" || d.status === "PROCESSING");

    return (
        <div className="grid gap-3 py-3">
            <div className="flex items-center justify-between">
                <dl className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1">
                        <dt className="text-(--text-secondary)">{t("orders.invoice.number")}:</dt>
                        <dd className="font-semibold">RE{invoice.invoiceId}</dd>
                    </div>
                    <div className="flex items-center gap-1">
                        <dt className="text-(--text-secondary)">{t("orders.invoice.date")}:</dt>
                        <dd>{formatDate(invoice.date)}</dd>
                    </div>
                </dl>
                <Button
                    size="xs"
                    variant="border"
                    loading={isRegenerating}
                    disabled={cancelled || busy || isRegenerating}
                    onClick={() => regenerateInvoice()}
                >
                    {t("orders.invoice.regenerate")}
                </Button>
            </div>

            {invoice.documents.map((document) => (
                <DocumentCard key={document.id} type="invoice" parentId={order.id} document={document} />
            ))}
            {invoice.documents.length === 0 && (
                <p className="text-sm text-(--text-secondary)">{t("orders.invoice.noDocument")}</p>
            )}
        </div>
    );
}
