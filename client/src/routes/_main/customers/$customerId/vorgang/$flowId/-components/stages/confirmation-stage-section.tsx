import ConfirmationModal, { type ConfirmationSubmitType } from "@/components/modules/modals/confirmation/confirmation-modal";
import { useModal, useCreateConfirmation, useRegenerateConfirmation, useDeleteConfirmation, useFormatters } from "@/hooks";
import { getErrorMessage } from "@/lib/errors";
import DocumentCard from "@/routes/_main/-components/card/document-card";
import type { Order, Confirmation } from "@keepit/schemas";
import { Dot, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { FlowStage } from "../../../../-components/flow/flow-types";
import StageShell from "../flow-stage-shell";
import { cancelledStageShell } from "../flow-detail-view";
import { Accordion, Button } from "@/components";

interface Props {
    stage: FlowStage;
    order: Order | null;
    confirmation: Confirmation | null;
}

export default function ConfirmationStageSection({ stage, order, confirmation }: Props) {
    const { t } = useTranslation();
    const modal = useModal<ConfirmationSubmitType>();

    const { formatDate } = useFormatters();

    const {
        createConfirmation,
        isCreatingConfirmation,
        errorCreatingConfirmation
    } = useCreateConfirmation(order?.id!);

    const {
        regenerateConfirmation,
        isRegenerating
    } = useRegenerateConfirmation(order?.id!);

    const {
        deleteConfirmation,
        isDeletingConfirmation,
        errorDeletingConfirmation
    } = useDeleteConfirmation(order?.id!);

    // Löschen ist nur erlaubt, solange kein noch aktives (nicht gelöschtes) Dokument existiert.
    const hasActiveDocument = Boolean(confirmation?.documents.some((d) => d.deletedAt == null));
    const canDelete = Boolean(confirmation) && !hasActiveDocument;

    const handleSubmit = async (values: ConfirmationSubmitType) => {
        await createConfirmation(values);
        modal.close();
    };

    const remove = async () => {
        if (!confirmation) return;
        if (!confirm(t("orders.confirmation.deleteConfirm", { number: confirmation.confirmationId }))) return;
        try { await deleteConfirmation(); } catch { /* unten gerendert */ }
    };

    const locked = Boolean(order?.acceptedAt || true);

    const cancelledView = cancelledStageShell(stage);
    if (cancelledView) return cancelledView;

    const renderHeaderActions = () => (
        <div className="flex gap-2">

            {confirmation && (
                <Button
                    size="xs"
                    variant="primary"
                    onClick={() => regenerateConfirmation()}
                    disabled={stage.state === "locked" || isRegenerating}
                    loading={isRegenerating}
                >
                    {t("orders.confirmation.regenerate")}
                </Button>
            )}

            <Button
                size="xs"
                variant="border"
                onClick={() => modal.open(confirmation)}
                disabled={stage.state === "locked"}
            >
                {confirmation ? t("button.edit") : t("button.create")}
            </Button>


            {confirmation && (
                <Button
                    size="xs"
                    variant="primary"
                    danger
                    disabled={!canDelete || isDeletingConfirmation}
                    loading={isDeletingConfirmation}
                    title={!canDelete ? t("orders.confirmation.deleteBlockedHint") : undefined}
                    onClick={remove}
                    icon={<Trash2 className="size-3" />}
                >
                    {t("button.delete")}
                </Button>
            )}
        </div>
    );

    if (!confirmation) {
        return (
            <StageShell stage={stage} headerActions={renderHeaderActions()}>
            </StageShell>
        );
    }

    return (
        <StageShell stage={stage}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center justify-start gap-4">
                    <div className="grid gap-0.5">
                        <div className="flex items-center gap-2">
                            <h1 className="font-medium">{t('flows.station.confirmation.label')}</h1>
                        </div>

                        <div className="flex items-center justify-start text-(--fg-3) text-sm">
                            <p className="font-mono">AB{confirmation.confirmationId}</p>
                            <Dot size={14} />
                            <p className="">{formatDate(confirmation.createdAt)}</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {renderHeaderActions()}
            </div>

            <Accordion defaultValue={["documents"]}>
                <Accordion.Section value="documents" label={t("flows.detail.documents")}>
                    <div className="px-4">
                        {confirmation.documents.map(document => (
                            <DocumentCard key={document.id} type="confirmation" parentId={order?.id!} document={document} />
                        ))}

                        {confirmation.documents.length === 0 && (
                            <p className="py-4 text-center text-sm text-(--fg-3)">{t("flows.detail.noDocuments")}</p>
                        )}

                        {(errorCreatingConfirmation || errorDeletingConfirmation) && (
                            <p role="alert" className="px-4 pt-3 text-sm text-(--destructive)">
                                {getErrorMessage(errorCreatingConfirmation ?? errorDeletingConfirmation)}
                            </p>
                        )}
                    </div>
                </Accordion.Section>
            </Accordion>

            {modal.isOpen && (
                <ConfirmationModal
                    data={modal.data ?? null}
                    onClose={modal.close}
                    onSubmit={handleSubmit}
                />
            )}
        </StageShell>
    );
}