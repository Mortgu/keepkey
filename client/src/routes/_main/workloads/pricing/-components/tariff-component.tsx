import { Plus, Trash } from "lucide-react";
import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import type { Tariff, TariffCell } from "@/types";
import { useTariffGroupHook } from "@/hooks";
import { Button, Input } from "@/components";
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

function RowLabel({ groupId, tariffId, rowId, minQty, maxQty }: {
    groupId: string;
    tariffId: string;
    rowId: string;
    minQty: number;
    maxQty: number | null;
}) {
    const { deleteRow, updateRow } = useTariffGroupHook();
    const [editMin, setEditMin] = useState(false);
    const [editMax, setEditMax] = useState(false);
    const [min, setMin] = useState(minQty);
    const [max, setMax] = useState(maxQty);

    const handleMinBlur = async () => {
        setEditMin(false);
        await updateRow({ groupId, tariffId, rowId, min_qty: min, max_qty: max ?? 0 });
    };

    const handleMaxBlur = async () => {
        setEditMax(false);
        await updateRow({ groupId, tariffId, rowId, min_qty: min, max_qty: max ?? 0 });
    };

    const handleMinChange = (e: ChangeEvent<HTMLInputElement>) => {
        const v = Number(e.target.value);
        if (isNaN(v)) return;
        setMin(v);
    };

    const handleMaxChange = (e: ChangeEvent<HTMLInputElement>) => {
        const v = Number(e.target.value);
        if (isNaN(v)) return;
        setMax(v);
    };

    return (
        <div className="flex-1 min-w-fit w-full flex flex-wrap items-center px-3 py-1">
            <div className="flex-1 flex items-center">
                {!editMin ? <p onClick={() => setEditMin(true)}>{min}</p> : (
                    <Input autoFocus size="xs" onBlur={handleMinBlur} value={min} onChange={handleMinChange} />
                )}
                -
                {!editMax ? <p onClick={() => setEditMax(true)}>{max ?? "∞"}</p> : (
                    <Input autoFocus size="xs" onBlur={handleMaxBlur} value={max ?? 0} onChange={handleMaxChange} />
                )}
            </div>
            <Button variant="link" size="xs" icon={<Trash className="size-3" />} iconOnly
                onClick={() => deleteRow({ groupId, tariffId, rowId })} />
        </div>
    );
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
