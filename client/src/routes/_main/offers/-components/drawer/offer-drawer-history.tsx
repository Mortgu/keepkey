import { Button, Drawer } from "@/components";
import { useDeleteOfferRevision } from "@/hooks/offers/offer-mutations";
import { formatDate } from "@/lib/format";
import type { Offer, OfferRevision } from "@/types";
import { Trash } from "lucide-react";
import { useEffect } from "react";
import { toast } from "react-toastify";

type Props = {
    open: boolean;
    onClose: () => void;
    offer: Offer;
}

export default function OfferDrawerHistory({ open, onClose, offer }: Props) {
    const {
        deleteOfferRevision,
        isDeletingRevision,
        errorDeletingRevision
    } = useDeleteOfferRevision();

    useEffect(() => {
        if (errorDeletingRevision) {
            toast.error(errorDeletingRevision.message);
        }
    }, [errorDeletingRevision]);

    return (
        <Drawer open={open} onClose={onClose} wide>
            <Drawer.Header title="History" subtitle="Vergangene Angebots versionen" />
            <Drawer.Body>
                {offer.revisions.length === 0 && (
                    <p className="text-sm text-(--text-secondary)">
                        Keine früheren Versionen vorhanden.
                    </p>
                )}

                {offer.revisions.map((revision: OfferRevision, index: number) => {
                    const isLast = index === offer.revisions.length - 1;

                    return (
                        <div key={index} className="flex relative gap-3.25 py-3.5 first:py-0 first:pb-3.5 border-b border-(--border) last:border-b-0">
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
                                        <span>{revision.changedBy?.name || ""}</span>
                                    </div>
                                </div>

                                {/* actions */}
                                <div className="flex gap-1.5 flex-wrap">
                                    <Button size="xs" variant="secondary">
                                        Restore this version
                                    </Button>

                                    <Button size="xs" variant="secondary" icon={<Trash className="size-3.5" />} iconOnly
                                        onClick={() => deleteOfferRevision({ offerId: offer.id, revisionId: revision.id })}
                                        loading={isDeletingRevision} disabled={errorDeletingRevision ? true : false || isDeletingRevision} />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </Drawer.Body>
        </Drawer>
    )
}