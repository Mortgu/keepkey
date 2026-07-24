import { useTariffHistoryHook } from "@/hooks";
import { formatDate } from "@/lib/format";
import type { TariffBase } from "@keepit/schemas";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

type Props = {
    productId: string;
    contractId: string;
}

export function TariffHistoryList({ productId, contractId }: Props) {
    const { history, isPending } = useTariffHistoryHook(productId, contractId);
    const [expandedVersion, setExpandedVersion] = useState<number | null>(null);

    if (isPending) return <p className="text-sm text-gray-500">Laden...</p>;
    if (history.length === 0) return <p className="text-sm text-gray-500">Keine Versionen vorhanden.</p>;

    return (
        <div className="grid gap-1">
            {history.map((entry) => {
                const snapshot = expandedVersion === entry.version && entry.snapshot
                    ? entry.snapshot as TariffBase
                    : null;

                return (
                    <div key={entry.id} className="border border-(--border) rounded-md">
                        <button
                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-(--page-bg) text-left"
                            onClick={() => setExpandedVersion(expandedVersion === entry.version ? null : entry.version)}
                        >
                            <div className="flex items-center gap-2">
                                <ChevronRight
                                    className={expandedVersion === entry.version ? "size-4 rotate-90 transition-all" : "transition-all size-4"} />
                                <span className="font-medium">Version {entry.version}</span>
                            </div>
                            <span className="text-sm text-gray-500">{formatDate(entry.createdAt)}</span>
                        </button>

                        {snapshot && (
                            <div className="border-t border-(--border) p-3">
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr>
                                            <th className="text-left p-1" />
                                            {snapshot.columns?.map(column => (
                                                <th key={column.id} className="p-1 text-center">{column.duration} Monate</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {snapshot.rows?.map(row => (
                                            <tr key={row.id}>
                                                <td className="p-1">{row.min_quantity} - {row.max_quantity ?? "∞"}</td>
                                                {snapshot.columns?.map(column => {
                                                    const cell = snapshot.cells?.find(
                                                        c => c.rowId === row.id && c.columnId === column.id
                                                    );
                                                    return (
                                                        <td key={column.id} className="p-1 text-center bg-(--page-bg) rounded">
                                                            {cell?.default_cells?.[0]?.price ?? "-"}
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
            })}
        </div>
    );
}
