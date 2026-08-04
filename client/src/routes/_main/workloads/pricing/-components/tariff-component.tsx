import { Plus } from "lucide-react";
import { useMemo } from "react";
import TariffCellComponent from "./cell-component";
import TariffColumnComponent from "./column-component";
import TariffRowComponent from "./row-component";
import type { TariffBase, TariffCell } from "@keepit/schemas";
import { useCreateTariffColumn, useCreateTariffRow, useUpdateTariffRow } from "@/hooks/tariffs/tariff-mutations";
import { Button } from "@/components";

type Props = {
    tariff: TariffBase;
};

function buildCellMap(cells: Array<TariffCell>): Map<string, TariffCell> {
    const map = new Map<string, TariffCell>();
    for (const cell of cells) {
        map.set(`${cell.rowId}:${cell.columnId}`, cell);
    }
    return map;
}

/**
 * Nächste freie Laufzeit. Feste Vorgaben würden mit einer bestehenden Spalte
 * kollidieren, seit doppelte Laufzeiten abgelehnt werden.
 */
function nextDuration(columns: TariffBase["columns"]): number {
    if (columns.length === 0) return 12;
    return columns.reduce((max, column) => Math.max(max, column.duration), 0) + 12;
}

export default function TariffComponent({ tariff }: Props) {
    const { createColumn } = useCreateTariffColumn();
    const { createRow } = useCreateTariffRow();
    const { updateRow } = useUpdateTariffRow();

    const groupId = tariff.tariffGroupId;
    const cells = tariff.cells;

    const cellMap = useMemo(() => buildCellMap(cells), [cells]);

    /**
     * Hängt eine Mengenstaffel lückenlos hinten an.
     *
     * Ist die letzte Staffel nach oben offen, gibt es hinter ihr keinen Platz —
     * sie wird deshalb zuerst begrenzt und die neue Staffel übernimmt den
     * offenen Rest. So bleiben die Bereiche überschneidungsfrei.
     */
    const handleAddRow = async () => {
        const sorted = [...tariff.rows].sort((a, b) => a.min_quantity - b.min_quantity);
        const last = sorted.at(-1);

        if (!last) {
            await createRow({ groupId, tariffId: tariff.id, min_quantity: 1, max_quantity: null });
            return;
        }

        if (last.max_quantity === null) {
            const boundary = last.min_quantity + 9;

            await updateRow({
                groupId, tariffId: tariff.id, rowId: last.id,
                min_quantity: last.min_quantity, max_quantity: boundary,
            });
            await createRow({ groupId, tariffId: tariff.id, min_quantity: boundary + 1, max_quantity: null });
            return;
        }

        await createRow({ groupId, tariffId: tariff.id, min_quantity: last.max_quantity + 1, max_quantity: null });
    };

    return (
        <div className="border-b border-(--border)">
            <div className="flex items-center">
                <table className="w-full">
                    <thead className="h-fit">
                        <tr className="border-b border-(--border) bg-(--subtle-50)">

                            <th className="border-r border-(--border)" />

                            {tariff.columns.map(column => (
                                <TariffColumnComponent key={column.id} groupId={groupId} tariffId={tariff.id} columnId={column.id} duration={column.duration} />
                            ))}

                            <th>
                                <Button variant="ghost" size="xs"
                                    title="Laufzeit hinzufügen"
                                    onClick={() => createColumn({ groupId, tariffId: tariff.id, duration: nextDuration(tariff.columns) })}
                                    icon={<Plus className="size-4" />} iconOnly />
                            </th>

                        </tr>

                    </thead>


                    <tbody>
                        {tariff.rows.map(row => (
                            <tr key={row.id}>
                                <TariffRowComponent groupId={groupId} tariffId={tariff.id} rowId={row.id}
                                    minQty={row.min_quantity} maxQty={row.max_quantity} />

                                {tariff.columns.map(column => {
                                    const cell = cellMap.get(`${row.id}:${column.id}`);

                                    // Zeile/Spalte existieren, aber es gibt keine Zelle dazu —
                                    // als leeres Feld darstellen statt als Platzhaltertext.
                                    if (!cell) {
                                        return (
                                            <td key={`${row.id}:${column.id}`}
                                                className="border border-(--border) px-3 py-1 bg-(--page-bg)" />
                                        );
                                    }

                                    return (
                                        <TariffCellComponent key={cell.id} groupId={groupId} tariffId={tariff.id} cell={cell} />
                                    );
                                })}
                                <td />
                            </tr>
                        ))}

                        <tr>
                            <td className=" border-b border-r border-(--border)">
                                <Button variant="secondary" size="xs" className="w-full px-4 py-1 border-none rounded-none"
                                    title="Mengenstaffel hinzufügen"
                                    onClick={handleAddRow}
                                    icon={<Plus className="size-4" />} iconOnly />
                            </td>
                        </tr>
                    </tbody>
                </table>


            </div>


        </div>
    );
}
