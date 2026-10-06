import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { InvoiceListItem } from "@keepit/schemas";
import { Badge } from "@/components";
import { formatDate } from "@/lib/format";
import DocumentCard from "@/routes/_main/-components/card/document-card";

interface Props {
    invoice: InvoiceListItem;
}

export default function InvoiceCard({ invoice }: Props) {
    const { t } = useTranslation();
    const current = invoice.documents.at(0);

    return (
        <div className="bg-white border border-(--border) rounded-md">
            <div className="flex items-center justify-between px-4 py-3 border-b border-(--border)">
                <div className="grid gap-1">
                    <div className="flex items-center gap-2 text-md">
                        <span className="text-(--text) font-semibold">RE{invoice.invoiceId}</span>
                        <span className="text-(--text)">{invoice.customer.companyName}</span>
                        {current && <Badge variant={current.status} size="xs" />}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-light">
                        <div className="flex items-center gap-1">
                            <label className="text-(--text-secondary)">{t("invoices.order")}:</label>
                            <Link to="/orders" className="text-(--text) underline-offset-2 hover:underline">
                                BE{invoice.order.orderId}
                            </Link>
                        </div>
                        <div className="flex items-center gap-1">
                            <label className="text-(--text-secondary)">{t("invoices.date")}:</label>
                            <p className="text-(--text)">{formatDate(invoice.date)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 py-2 grid gap-2">
                {invoice.documents.map((document) => (
                    <DocumentCard key={document.id} type="invoice" parentId={invoice.orderId} document={document} />
                ))}
                {invoice.documents.length === 0 && (
                    <p className="text-sm text-(--text-secondary) py-2">{t("orders.invoice.noDocument")}</p>
                )}
            </div>
        </div>
    );
}
