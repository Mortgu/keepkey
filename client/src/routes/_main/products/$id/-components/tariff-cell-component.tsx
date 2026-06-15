import type {NewTariffCell} from "@/types";
import {formatEur} from "@/utils/utils.ts";
import {useState} from "react";
import {Input} from "@/components";

type Props = {
    cell: NewTariffCell;
    onPriceChange: (price: number) => void;
}

export default function TariffCellComponent({cell, onPriceChange}: Props) {
    const [edit, setEdit] = useState<boolean>(false);
    const [price, setPrice] = useState<number>(cell.price);

    const handleBlur = () => {
        setEdit(false);
        if (price !== cell.price) {
            onPriceChange(price);
        }
    };

    return (
        <div onClick={() => setEdit(true)}
             className="flex-1 border border-(--border) rounded-md hover:bg-(--page-bg) min-w-50">
            {edit ? (
                <div className="w-full h-full py-2 px-3 flex items-center justify-center">
                    <Input autoFocus size="xs" onBlur={handleBlur} value={price}
                           onChange={(e) => {
                               const value = Number(e.target.value);

                               if (isNaN(value)) {
                                   return;
                               }

                               setPrice(value);
                           }}/>
                </div>
            ) : (
                <div className="text-right py-2 px-3 pointer-events-none">
                    <p>{formatEur(cell.price)}</p>
                    <p className="text-sm text-(--text-secondary)">/Nutzer</p>
                </div>
            )}
        </div>
    )
}