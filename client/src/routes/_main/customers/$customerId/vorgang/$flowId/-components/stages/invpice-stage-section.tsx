import InvoiceModal, { type InvoiceSubmitType } from "@/components/modules/modals/invoice/invoice-modal";
import { useModal, useCreateInvoice, useRegenerateInvoice, useDeleteInvoice } from "@/hooks";
import { getErrorMessage } from "@/lib/errors";
import DocumentCard from "@/routes/_main/-components/card/document-card";
import { type Order, type Invoice } from "@keepit/schemas";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { FlowStage } from "../../../../-components/flow/flow-types";
import { cancelledStageShell } from "../flow-detail-view";
import StageShell from "../flow-stage-shell";
import { Button } from "@/components";

export default function InvoiceStageSection({ stage, order, invoice }: { stage: FlowStage; order: Order | null; invoice: Invoice | null }) {
    const { t } = useTranslation();
    const modal = useModal<InvoiceSubmitType>();

    const {
        createInvoice,
        isCreatingInvoice,
        errorCreatingInvoice
    } = useCreateInvoice(order?.id!);

    const {
        regenerateInvoice,
        isRegenerating
    } = useRegenerateInvoice(order?.id!);

    const {
        deleteInvoice,
        isDeletingInvoice,
        errorDeletingInvoice
    } = useDeleteInvoice(order?.id!);

    // Löschen ist nur erlaubt, solange kein noch aktives (nicht gelöschtes) Dokument existiert.
    const hasActiveDocument = Boolean(invoice?.documents.some((d) => d.deletedAt == null));
    const canDelete = Boolean(invoice) && !hasActiveDocument;

    const handleSubmit = async (values: InvoiceSubmitType) => {
        await createInvoice(values);
        modal.close();
    };

    const remove = async () => {
        if (!invoice) return;
        if (!confirm(t("orders.invoice.deleteConfirm", { number: invoice.invoiceId }))) return;
        try { await deleteInvoice(); } catch { /* unten gerendert */ }
    };

    const cancelledView = cancelledStageShell(stage);
    if (cancelledView) return cancelledView;

    const renderHeaderActions = () => (
        <>
            <Button
                size="xs"
                variant="secondary"
                onClick={() => modal.open(invoice)}
                disabled={stage.state === "locked"}
            >
                {invoice ? t("button.edit") : t("button.create")}
            </Button>

            {invoice && (
                <Button
                    size="xs"
                    variant="primary"
                    onClick={() => regenerateInvoice()}
                    disabled={stage.state === "locked" || isRegenerating}
                    loading={isRegenerating}
                >
                    {t("orders.invoice.regenerate")}
                </Button>
            )}

            {invoice && (
                <Button
                    size="xs"
                    variant="secondary"
                    danger
                    disabled={!canDelete || isDeletingInvoice}
                    loading={isDeletingInvoice}
                    title={!canDelete ? t("orders.invoice.deleteBlockedHint") : undefined}
                    onClick={remove}
                    icon={<Trash2 className="size-3" />}
                >
                    {t("button.delete")}
                </Button>
            )}
        </>
    );

    return (
        <StageShell stage={stage} headerActions={renderHeaderActions()}>
            {(errorCreatingInvoice || errorDeletingInvoice) && (
                <p role="alert" className="px-4 pt-3 text-sm text-(--destructive)">
                    {getErrorMessage(errorCreatingInvoice ?? errorDeletingInvoice)}
                </p>
            )}

            <div className="px-4">
                {invoice?.documents.map(document => (
                    <DocumentCard key={document.id} type="invoice" parentId={order?.id!} document={document} />
                ))}
            </div>

            {modal.isOpen && (
                <InvoiceModal
                    data={modal.data ?? null}
                    onClose={modal.close}
                    onSubmit={handleSubmit}
                />
            )}
        </StageShell>
    );
}