import { Button } from "@/components";
import { useTariffGroupHook } from "@/hooks";
import { Trash } from "lucide-react";
import { useState, type ChangeEvent } from "react";

interface Props {
    groupId: string;
    tariffId: string;
    rowId: string;
    minQty: number;
    maxQty: number | null;
}

export default function TariffRowComponent(props: Props) {
    const { groupId, tariffId, rowId, minQty, maxQty } = props;

    const [editMin, setEditMin] = useState(false);
    const [editMax, setEditMax] = useState(false);
    const [min, setMin] = useState(minQty);
    const [max, setMax] = useState(maxQty);

    const { deleteRow, updateRow } = useTariffGroupHook();

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
        <td className="border-b border-r border-(--border)">
            <div className="flex-1 min-w-fit w-full flex flex-wrap items-center px-3 py-1">
                <div className="flex-1 flex items-center gap-3">
                    <div className="relative max-w-fit box-border">
                        <p onClick={() => setEditMin(true)}>{min}</p>
                        {editMin && (
                            <input className="absolute inset-0 w-fit box-border" type="text" value={min}
                                autoFocus onBlur={handleMinBlur} onChange={handleMinChange} />
                        )}
                    </div>
                    -
                    <div className="relative max-w-fit box-border">
                        <p onClick={() => setEditMax(true)}>{max}</p>
                        {editMax && (
                            <input className="absolute inset-0 w-fit box-border" type="text" value={max ?? 0}
                                autoFocus onBlur={handleMaxBlur} onChange={handleMaxChange} />
                        )}
                    </div>
                </div>
                <Button variant="link" size="xs" icon={<Trash className="size-3" />} iconOnly
                    onClick={() => deleteRow({ groupId, tariffId, rowId })} />
            </div>
        </td>
    );
}
