import { formatDate } from "@/lib/format";
import { useOfferRevisionsHook } from "@/hooks";

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
        <div className="grid gap-2 px-4 py-3">
            {revisions.map((rev) => (
                <div
                    key={rev.id}
                    className="flex items-center justify-between border border-(--border) py-2 px-3 rounded-md"
                >
                    <div className="flex items-center gap-3 text-sm">
                        <span className="font-medium text-(--text)">v{rev.version}</span>
                        <span className="text-(--text-secondary) font-light">
                            {formatDate(rev.createdAt)}
                        </span>
                    </div>
                    {rev.changedBy && (
                        <span className="text-xs text-(--text-secondary) font-light">
                            {rev.changedBy}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}
