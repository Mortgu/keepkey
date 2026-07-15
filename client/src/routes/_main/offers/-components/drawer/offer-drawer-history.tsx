import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import type { Offer, OfferRevision } from "@/types";
import { Button, Drawer } from "@/components";
import { useRestoreOfferRevision } from "@/hooks/offers/offer-mutations";
import { offerQueries } from "@/hooks/offers/offer-queries";
import { formatDate } from "@/lib/format";

type Props = {
    open: boolean;
    onClose: () => void;
    offer: Offer;
}

export default function OfferDrawerHistory({ open, onClose, offer }: Props) {
    const { t } = useTranslation();
    const { data: revisions = [], isPending, error } = useQuery({
        ...offerQueries.revisions(offer.id),
        enabled: open,
    });
    const {
        restoreOfferRevision,
        isRestoringRevision,
        restoringRevisionId,
        errorRestoringRevision,
    } = useRestoreOfferRevision();

    useEffect(() => {
        if (errorRestoringRevision) {
            toast.error(errorRestoringRevision.message);
        }
    }, [errorRestoringRevision]);

    const restore = async (revision: OfferRevision) => {
        if (!confirm(t("versionHistory.restoreConfirm", { version: revision.version }))) return;
        try {
            await restoreOfferRevision({
                offerId: offer.id,
                revisionId: revision.id,
                expectedVersion: offer.version,
            });
            toast.success(t("versionHistory.restoreSuccess"));
        } catch {
            // The mutation error is surfaced by the effect above.
        }
    };

    return (
        <Drawer open={open} onClose={onClose} wide>
            <Drawer.Header title={t("versionHistory.title")} subtitle={t("versionHistory.offerSubtitle")} />
            <Drawer.Body>
                <div className="mb-3 rounded-md border border-(--border) px-3 py-2 text-sm">
                    {t("versionHistory.currentVersion", { version: offer.version })}
                </div>

                {isPending && <p className="text-sm text-(--text-secondary)">{t("common.loading")}</p>}
                {error && <p className="text-sm text-(--error)">{error.message}</p>}
                {!isPending && !error && revisions.length === 0 && (
                    <p className="text-sm text-(--text-secondary)">
                        {t("versionHistory.empty")}
                    </p>
                )}

                {revisions.map((revision: OfferRevision, index: number) => {
                    const isLast = index === revisions.length - 1;

                    return (
                        <div key={revision.id} className="flex relative gap-3.25 py-3.5 first:py-0 first:pb-3.5 border-b border-(--border) last:border-b-0">
                            {/* vertical-rail */}
                            <div className="flex flex-col items-center shrink-0 pt-0.75">
                                {/* vertical-dot */}
                                <div className="w-2.75 h-2.75 rounded-full border-2 border-(--border)"></div>

                                {/* vertical-line */}
                                {!isLast && (
                                    <div className="w-[2px] flex-1 bg-(--border) mt-[4px]"></div>
                                )}
                            </div>

                            {/* main */}
                            <div className="flex-1 flex items-center justify-between">
                                <div className="grid">
                                    <div className="flex items-baseline gap-2 flex-wrap">
                                        <span className="text-[13px] font-semibold">
                                            v{revision.version}
                                        </span>
                                    </div>

                                    {/* when */}
                                    <div className="flex items-center text-[11px] text-(--fg-3) mt-0.5 gap-2">
                                        <span>{formatDate(revision.createdAt)}</span>
                                        <span>·</span>
                                        <span>{revision.changedBy.name}</span>
                                    </div>
                                </div>

                                {/* actions */}
                                <div className="flex gap-1.5 flex-wrap">
                                    <Button size="xs" variant="secondary"
                                        onClick={() => restore(revision)}
                                        loading={isRestoringRevision && restoringRevisionId === revision.id}
                                        disabled={isRestoringRevision}>
                                        {t("versionHistory.restore")}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </Drawer.Body>
        </Drawer>
    )
}
