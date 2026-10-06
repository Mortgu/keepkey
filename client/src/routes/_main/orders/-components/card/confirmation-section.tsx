import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Order } from "@keepit/schemas";
import { Button, Input, ListSkeleton, Skeleton } from "@/components";
import { useConfirmation, useCreateConfirmation, useRegenerateConfirmation } from "@/hooks";
import { getErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import DocumentCard from "@/routes/_main/-components/card/document-card";

interface Props {
    order: Order;
}

/**
 * Auftragsbestätigung einer Bestellung: Solange keine existiert, ein kleines
 * Formular (AB-Nr., Datum). Danach Nummer, Datum und das Dokument. Die Nummer
 * ist nach dem Anlegen fest.
 */
export default function ConfirmationSection({ order }: Props) {
    const { t } = useTranslation();
    const { confirmation, isPending, error } = useConfirmation(order.id);
    const { createConfirmation, isCreatingConfirmation, errorCreatingConfirmation } = useCreateConfirmation(order.id);
    const { regenerateConfirmation, isRegenerating } = useRegenerateConfirmation(order.id);

    const [confirmationId, setConfirmationId] = useState("");
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

    const cancelled = Boolean(order.cancelledAt);

    if (isPending) {
        return <ListSkeleton rows={1} skeleton={<Skeleton className="h-10" />} />;
    }
    if (error) {
        return <p role="alert" className="py-3 text-sm text-(--destructive)">{getErrorMessage(error)}</p>;
    }

    if (!confirmation) {
        const submit = async (event: React.FormEvent) => {
            event.preventDefault();
            if (!confirmationId.trim()) return;
            try {
                await createConfirmation({ confirmationId: confirmationId.trim(), date });
            } catch {
                // Fehler wird unten gerendert.
            }
        };

        return (
            <form onSubmit={submit} className="grid gap-3 py-3">
                <p className="text-sm text-(--text-secondary)">{t("orders.confirmation.hint")}</p>
                {errorCreatingConfirmation && (
                    <p role="alert" className="text-sm text-(--destructive)">{getErrorMessage(errorCreatingConfirmation)}</p>
                )}
                <div className="flex items-end gap-4">
                    <Input
                        id={`confirmation-id-${order.id}`}
                        label={t("orders.confirmation.number")}
                        prefix="AB"
                        value={confirmationId}
                        onChange={(e) => setConfirmationId(e.target.value)}
                        disabled={cancelled}
                    />
                    <Input
                        id={`confirmation-date-${order.id}`}
                        type="date"
                        label={t("orders.confirmation.date")}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        disabled={cancelled}
                    />
                    <Button
                        type="submit"
                        size="sm"
                        loading={isCreatingConfirmation}
                        disabled={cancelled || isCreatingConfirmation || !confirmationId.trim()}
                    >
                        {t("orders.confirmation.create")}
                    </Button>
                </div>
            </form>
        );
    }

    const busy = confirmation.documents.some((d) => d.status === "PENDING" || d.status === "PROCESSING");

    return (
        <div className="grid gap-3 py-3">
            <div className="flex items-center justify-between">
                <dl className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1">
                        <dt className="text-(--text-secondary)">{t("orders.confirmation.number")}:</dt>
                        <dd className="font-semibold">AB{confirmation.confirmationId}</dd>
                    </div>
                    <div className="flex items-center gap-1">
                        <dt className="text-(--text-secondary)">{t("orders.confirmation.date")}:</dt>
                        <dd>{formatDate(confirmation.date)}</dd>
                    </div>
                </dl>
                <Button
                    size="xs"
                    variant="border"
                    loading={isRegenerating}
                    disabled={cancelled || busy || isRegenerating}
                    onClick={() => regenerateConfirmation()}
                >
                    {t("orders.confirmation.regenerate")}
                </Button>
            </div>

            {confirmation.documents.map((document) => (
                <DocumentCard key={document.id} type="confirmation" parentId={order.id} document={document} />
            ))}
            {confirmation.documents.length === 0 && (
                <p className="text-sm text-(--text-secondary)">{t("orders.confirmation.noDocument")}</p>
            )}
        </div>
    );
}
