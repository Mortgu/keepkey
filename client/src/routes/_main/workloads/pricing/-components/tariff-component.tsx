import { Plus } from "lucide-react";
import { useMemo } from "react";
import type { Tariff, TariffCell } from "@/types";
import { useTariffGroupHook } from "@/hooks";
import { Button } from "@/components";
import TariffCellComponent from "./cell-component";
import TariffColumnComponent from "./column-component";
import TariffRowComponent from "./row-component";

type Props = {
    tariff: Tariff;
};

function buildCellMap(cells: Array<TariffCell>): Map<string, TariffCell> {
    const map = new Map<string, TariffCell>();
    for (const cell of cells) {
        map.set(`${cell.rowId}:${cell.columnId}`, cell);
    }
    return map;
}

export default function TariffComponent(props: Props) {
    const { tariff } = props;
    const { createColumn, createRow } = useTariffGroupHook();

    const groupId = tariff.tariffGroupId;


    const cellMap = useMemo(() => buildCellMap(tariff.cells), [tariff.cells]);

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
                                    onClick={() => createColumn({ groupId, tariffId: tariff.id, duration: 1 })}
                                    icon={<Plus className="size-4" />} iconOnly />
                            </th>

                        </tr>

                    </thead>


                    <tbody>
                        {tariff.rows.map(row => (
                            <tr key={row.id}>
                                <TariffRowComponent groupId={groupId} tariffId={tariff.id} rowId={row.id}
                                    minQty={row.min_quantity} maxQty={row.max_quantity ?? 0} />

                                {tariff.columns.map(column => {
                                    const cell = cellMap.get(`${row.id}:${column.id}`);

                                    if (!cell) {
                                        return <>NaC</>
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
                                    onClick={() => createRow({ groupId, tariffId: tariff.id, min_qty: 1, max_qty: 100 })}
                                    icon={<Plus className="size-4" />} iconOnly />
                            </td>
                        </tr>
                    </tbody>
                </table>


            </div>


        </div>
    );
}
