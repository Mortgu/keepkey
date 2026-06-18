import { formatDate } from "@/lib/format";
import { useOfferRevisionsHook } from "@/hooks";
import { Button } from "@/components";

type Props = {
    offerId: string;
};

export default function OfferRevisionHistory({ offerId }: Props) {
    const { revisions } = useOfferRevisionsHook(offerId);

    if (revisions.length === 0) {
        return (
            <p className="text-sm text-(--text-secondary) px-4 py-3">
                Keine früheren Versionen vorhanden.
            </p>
        );
    }

    return (
        <div className="flex flex-col">
            {revisions.map((rev, i) => {
                const isLast = i === revisions.length - 1;

                return (
                    <div
                        key={rev.id}
                        className="flex relative gap-3.25 py-3.5 border-b border-(--border) last:border-b-0"
                    >
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
                                        v{rev.version}
                                    </span>
                                </div>

                                {/* when */}
                                <div className="text-[11px] text-(--fg-3) mt-0.5">
                                    {formatDate(rev.createdAt)}
                                    {rev.changedBy ? ` · ${rev.changedBy}` : ""}
                                </div>
                            </div>

                            {/* actions */}
                            <div className="flex gap-1.5 flex-wrap">
                                <Button size="xs" variant="secondary">
                                    Restore this version
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
