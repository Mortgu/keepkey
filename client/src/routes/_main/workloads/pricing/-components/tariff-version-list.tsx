import { ChevronRight, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { TariffVersion } from "@keepit/schemas";
import { Badge, Button, Skeleton, showToast } from "@/components";
import { useTariffVersionsHook } from "@/hooks";
import { useRestoreTariffVersion } from "@/hooks/tariffs/tariff-mutations";
import { formatDate } from "@/lib/format";
import { formatEur } from "@/utils/utils";

type Props = {
    groupId: string;
    tariffId: string;
}

export function TariffVersionList({ groupId, tariffId }: Props) {
    const { t } = useTranslation();
    const { versions, isPending } = useTariffVersionsHook(groupId, tariffId);
    const { restoreVersion, isPending: restoringVersion } = useRestoreTariffVersion();

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);

    const handleRestore = async (versionId: string) => {
        try {
            await restoreVersion({ groupId, tariffId, versionId });
            showToast.success("workloads.pricing.toast.versionRestored");
            setConfirmingId(null);
        } catch {
            // Der globale onError-Handler zeigt die Server-Meldung bereits an.
        }
    };

    if (isPending) return <Skeleton shape="text" className="w-48" />;
    if (versions.length === 0) return <p className="text-sm text-(--text-secondary)">{t("workloads.pricing.versions.empty")}</p>;

    return (
        <div className="grid gap-1">
            {versions.map((version) => (
                <VersionRow
                    key={version.id}
                    version={version}
                    expanded={expandedId === version.id}
                    onToggle={() => setExpandedId(expandedId === version.id ? null : version.id)}
                    confirming={confirmingId === version.id}
                    onConfirm={() => setConfirmingId(version.id)}
                    onCancelConfirm={() => setConfirmingId(null)}
                    onRestore={() => handleRestore(version.id)}
                    restoring={restoringVersion}
                />
            ))}
        </div>
    );
}

type VersionRowProps = {
    version: TariffVersion;
    expanded: boolean;
    onToggle: () => void;
    confirming: boolean;
    onConfirm: () => void;
    onCancelConfirm: () => void;
    onRestore: () => void;
    restoring: boolean;
}

function VersionRow({
    version, expanded, onToggle, confirming, onConfirm, onCancelConfirm, onRestore, restoring,
}: VersionRowProps) {
    const { t } = useTranslation();
    const { snapshot } = version;

    return (
        <div className="border border-(--border) rounded-md">
            <div className="flex items-center justify-between gap-2 pr-2">
                <button
                    className="flex-1 flex items-center justify-between gap-3 px-3 py-2 hover:bg-(--page-bg) text-left"
                    onClick={onToggle}
                >
                    <div className="flex items-center gap-2">
                        <ChevronRight className={expanded ? "size-4 rotate-90 transition-all" : "size-4 transition-all"} />
                        <span className="font-medium">{t("workloads.pricing.versions.version", { version: version.version })}</span>
                        {version.isCurrent && <Badge variant="GENERATED" size="xs">{t("workloads.pricing.versions.current")}</Badge>}
                        {version.usageCount > 0 && (
                            <span className="text-xs text-(--text-secondary)">
                                {t("workloads.pricing.versions.usedIn", { count: version.usageCount })}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="text-sm text-(--text-secondary)">{formatDate(version.createdAt)}</span>
                        <span className="text-xs text-(--text-secondary)">
                            {t(`workloads.pricing.versions.reason.${version.reason}`)}
                            {version.createdBy ? ` · ${version.createdBy.name}` : ""}
                        </span>
                    </div>
                </button>

                {!version.isCurrent && !confirming && (
                    <Button size="xs" variant="secondary" icon={<RotateCcw className="size-3.5" />} iconOnly
                        onClick={onConfirm} />
                )}

                {confirming && (
                    <div className="flex items-center gap-1">
                        <Button size="xs" variant="border" onClick={onCancelConfirm}>{t("button.cancel")}</Button>
                        <Button size="xs" variant="primary" onClick={onRestore} loading={restoring} disabled={restoring}>
                            {t("workloads.pricing.versions.restore")}
                        </Button>
                    </div>
                )}
            </div>

            {expanded && (
                <div className="border-t border-(--border) p-3 overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr>
                                <th className="text-left p-1" />
                                {snapshot.columns.map((column) => (
                                    <th key={column.duration} className="p-1 text-center">{column.duration} {t("common.months")}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {snapshot.rows.map((row) => (
                                <tr key={row.min_quantity}>
                                    <td className="p-1 whitespace-nowrap">{row.min_quantity} – {row.max_quantity ?? "∞"}</td>
                                    {snapshot.columns.map((column) => {
                                        const cell = snapshot.cells.find(
                                            (c) => c.min_quantity === row.min_quantity && c.duration === column.duration,
                                        );

                                        return (
                                            <td key={column.duration} className="p-1 text-center bg-(--page-bg) rounded font-mono">
                                                {cell?.price == null ? "–" : formatEur(cell.price)}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
