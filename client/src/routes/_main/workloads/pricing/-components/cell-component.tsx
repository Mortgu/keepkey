import { useUpdateTariffCell } from "@/hooks/tariffs/tariff-mutations";
import type { TariffCell } from "@/types";
import { formatEur } from "@/utils/utils";
import { useState, type ChangeEvent } from "react";

interface Props {
    groupId: string;
    tariffId: string;
    cell: TariffCell;
}

export default function TariffCellComponent({ groupId, tariffId, cell }: Props) {
    const [edit, setEdit] = useState<boolean>(false);
    const [price, setPrice] = useState<number>(cell.default_cells[0].price);

    const { updateCell } = useUpdateTariffCell();

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
        <td className="relative border border-(--border) px-3 py-1"
            onClick={() => setEdit(true)}>
            {edit && (
                <input className="absolute  inset-3  w-fit box-border" type="text" value={price}
                    autoFocus onBlur={handleBlur} onChange={handleChange} />
            )}
            {!edit && (
                <p className="text-sm font-normal">{formatEur(price || 0)}</p>
            )}
        </td>
    )
}