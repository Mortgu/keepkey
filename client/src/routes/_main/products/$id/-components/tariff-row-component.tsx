import type {TariffRow} from "@/types";
import {type ChangeEvent, useState} from "react";
import {Button, Input} from "@/components";
import {Trash} from "lucide-react";
import {useTariffHook} from "@/hooks";

type Props = {
    tariffId: string;
    row: TariffRow;
}

export default function TariffRowComponent(props: Props) {
    const {row, tariffId} = props;

    const [min_qty, setMinQty] = useState<number>(row.min_quantity);
    const [editMin, setEditMin] = useState<boolean>(false);

    const [max_qty, setMaxQty] = useState<number>(row.max_quantity);
    const [editMax, setEditMax] = useState<boolean>(false);

    const {deleteRow, updateRow} = useTariffHook();

    const handleMinBlur = async () => {
        await updateRow({
            tariffId: tariffId,
            rowId: row.id,
            min_qty: min_qty,
            max_qty: max_qty,
        });

        setEditMin(false);
    }

    const handleMinChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (isNaN(value)) return;
        setMinQty(value);
    }

    const handleMaxBlur = async () => {
        await updateRow({
            tariffId: tariffId,
            rowId: row.id,
            min_qty: min_qty,
            max_qty: max_qty,
        });

        setEditMax(false);
    }

    const handleMaxChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (isNaN(value)) return;
        setMaxQty(value);
    }

    return (
        <div className="flex-1 min-w-fit w-full flex flex-wrap items-center gap-2">
            <div className="flex-1 flex gap-1 items-center">
                {!editMin && (
                    <p onClick={() => setEditMin(true)}>{min_qty}</p>
                )}

                {editMin && (
                    <div>
                        <Input
                            autoFocus
                            size="xs"
                            onBlur={handleMinBlur}
                            value={min_qty}
                            onChange={handleMinChange}
                        />
                    </div>
                )}

                -
                {!editMax && (
                    <p onClick={() => setEditMax(true)}>{max_qty}</p>
                )}

                {editMax && (
                    <div>
                        <Input
                            autoFocus
                            size="xs"
                            onBlur={handleMaxBlur}
                            value={max_qty}
                            onChange={handleMaxChange}
                        />
                    </div>
                )}
            </div>
            <Button variant="link" size="xs" icon={<Trash className="size-3"/>} iconOnly
                    onClick={() => deleteRow({tariffId: tariffId, rowId: row.id})}/>


        </div>
    )
}