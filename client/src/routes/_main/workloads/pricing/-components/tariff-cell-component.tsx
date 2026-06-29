import { useState } from "react";
import type { ChangeEvent } from "react";
import type { TariffCellDefault } from "@/types";
import { Input } from "@/components";
import { useTariffGroupHook } from "@/hooks";
import { formatEur } from "@/utils/utils.ts";

type Props = {
    groupId: string;
    tariffId: string;
    cell: TariffCellDefault;
}

export default function TariffCellComponent(props: Props) {
    const { groupId, tariffId, cell } = props;

    const [edit, setEdit] = useState<boolean>(false);
    const [price, setPrice] = useState<number>(cell.price);

    const { updateCell } = useTariffGroupHook();

    const handleBlur = async () => {
        await updateCell({
            groupId: groupId,
            tariffId: tariffId,
            cellId: cell.cellId,
            default_price: price,
        });

        setEdit(false);
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);

        if (isNaN(value)) return;

        setPrice(value);
    }

    return (
        <div onClick={() => setEdit(true)}
            className="w-auto h-15 border border-(--border) rounded-sm flex items-center justify-end p-2 hover:bg-(--page-bg)">
            {edit && (
                <div className="w-fit">
                    <Input
                        autoFocus
                        size="xs"
                        onBlur={handleBlur}
                        value={price}
                        onChange={handleChange}
                    />
                </div>
            )}

            {!edit && (
                <div className="">
                    <p className="text-md font-semibold">{formatEur(price || 0)}</p>
                    <p className="text-(--fg-3) text-sm font-light">/Nutzer</p>
                </div>
            )}

        </div>
    )
}
