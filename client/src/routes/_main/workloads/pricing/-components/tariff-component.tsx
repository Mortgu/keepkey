import { Plus, Trash } from "lucide-react";
import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import type { Tariff, TariffCell } from "@/types";
import { useTariffGroupHook } from "@/hooks";
import { Button, Input } from "@/components";
import { formatEur } from "@/utils/utils.ts";

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

function CellInput({ groupId, tariffId, cell }: { groupId: string; tariffId: string; cell: TariffCell }) {
    const { updateCell } = useTariffGroupHook();
    const [edit, setEdit] = useState(false);
    const [price, setPrice] = useState(cell.default_cells[0]?.price ?? 0);

    const handleBlur = async () => {
        setEdit(false);
        await updateCell({
            groupId,
            tariffId,
            cellId: cell.id,
            default_price: price,
        });
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (isNaN(value)) return;
        setPrice(value);
    };

    return (
        <div onClick={() => setEdit(true)}
            className="h-15 border border-(--border) rounded-sm flex items-center justify-end p-2 hover:bg-(--page-bg)">
            {edit && (
                <Input autoFocus size="xs" onBlur={handleBlur} value={price} onChange={handleChange} />
            )}
            {!edit && (
                <div>
                    <p className="text-md font-semibold">{formatEur(price || 0)}</p>
                    <p className="text-(--fg-3) text-sm font-light">/Nutzer</p>
                </div>
            )}
        </div>
    );
}

function ColumnHeader({ groupId, tariffId, columnId, duration }: {
    groupId: string;
    tariffId: string;
    columnId: string;
    duration: number;
}) {
    const { deleteColumn, updateColumn } = useTariffGroupHook();
    const [edit, setEdit] = useState(false);
    const [value, setValue] = useState(duration);

    const handleBlur = async () => {
        setEdit(false);
        await updateColumn({ groupId, tariffId, columnId, duration: value });
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const v = Number(e.target.value);
        if (isNaN(v)) return;
        setValue(v);
    };

    return (
        <div className="flex items-center justify-between relative text-center rounded-md px-3">
            <div onClick={() => setEdit(true)}>{value} Monate</div>
            {edit && (
                <div className="absolute top-0 left-0 w-full">
                    <Input autoFocus size="xs" onBlur={handleBlur} value={value} onChange={handleChange} />
                </div>
            )}
            <Button icon={<Trash className="size-3.5" />} iconOnly variant="link" size="xs"
                onClick={() => deleteColumn({ groupId, tariffId, columnId })} />
        </div>
    );
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
        <div className="flex-1 min-w-fit w-full flex flex-wrap items-center gap-2">
            <div className="flex-1 flex gap-1 items-center">
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
        <div className="grid ">
            <div className="grid gap-2">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="text-left p-2" />
                            {tariff.columns.map(column => (
                                <th key={column.id} className="p-2">
                                    <ColumnHeader groupId={groupId} tariffId={tariff.id} columnId={column.id}
                                        duration={column.duration} />
                                </th>
                            ))}
                            <th className="p-1">
                                <Button className="border-dashed" variant="secondary" size="xs"
                                    onClick={() => createColumn({ groupId, tariffId: tariff.id, duration: 1 })}
                                    icon={<Plus className="size-4" />} />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {tariff.rows.map(row => (
                            <tr key={row.id}>
                                <td className="p-2">
                                    <RowLabel groupId={groupId} tariffId={tariff.id} rowId={row.id}
                                        minQty={row.min_quantity} maxQty={row.max_quantity ?? 0} />
                                </td>
                                {tariff.columns.map(column => {
                                    const cell = cellMap.get(`${row.id}:${column.id}`);
                                    return (
                                        <td key={column.id} className="p-2">
                                            {cell && <CellInput groupId={groupId} tariffId={tariff.id} cell={cell} />}
                                        </td>
                                    );
                                })}
                                <td />
                            </tr>
                        ))}
                    </tbody>
                </table>

                <Button className="border-dashed h-full w-full" variant="secondary" size="sm"
                    onClick={() => createRow({ groupId, tariffId: tariff.id, min_qty: 1, max_qty: 100 })}>
                    Create Row
                </Button>
            </div>
        </div>
    );
}
