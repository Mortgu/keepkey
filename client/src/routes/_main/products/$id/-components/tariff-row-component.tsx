import type {Customer, NewTariffCell, NewTariffRow} from "@/types";
import {Button, Input} from "@/components";
import {X} from "lucide-react";
import TariffCellComponent from "@/routes/_main/products/$id/-components/tariff-cell-component.tsx";
import {useEffect, useState} from "react";

type Props = {
    row: NewTariffRow;
    cells: Array<NewTariffCell>;
    selectedCustomer: Customer | null;
    onRemove: () => void;
    onUpdateCell: (cellId: string, price: number) => void;
};

export default function TariffRowComponent(props: Props) {
    const {
        row,
        cells,
        selectedCustomer,
        onRemove,
        onUpdateCell,
    } = props;

    const [editMin, setEditMin] = useState<boolean>(false);
    const [minQuantity, setMinQuantity] = useState<number>(row.min_quantity);

    const [editMax, setEditMax] = useState<boolean>(false);
    const [maxQuantity, setMaxQuantity] = useState<number>(row.max_quantity);

    useEffect(() => {
        setMinQuantity(row.min_quantity);
    }, [row.min_quantity]);

    useEffect(() => {
        setMaxQuantity(row.max_quantity);
    }, [row.max_quantity]);
    

    return (
        <div className="flex gap-2">
            <div className="w-full max-w-50 flex items-center justify-between gap-2">
                <div className="flex-1 flex items-center justify-start gap-2">
                    {!editMin && (<p onClick={() => setEditMin(true)}>{minQuantity}</p>)}
                    {editMin && (
                        <div className="w-15">
                            <Input autoFocus size="xs" onBlur={() => setEditMin(false)} value={minQuantity}
                                   onChange={(e) => {
                                       const value = Number(e.target.value);

                                       if (isNaN(value)) {
                                           return
                                       }

                                       setMinQuantity(value);
                                   }}
                            />
                        </div>
                    )}
                    -
                    {!editMax && (<p onClick={() => setEditMax(true)}>{maxQuantity}</p>)}
                    {editMax && (
                        <div className="w-15">
                            <Input autoFocus size="xs" onBlur={() => setEditMax(false)} value={maxQuantity}
                                   onChange={(e) => {
                                       const value = Number(e.target.value);

                                       if (isNaN(value)) {
                                           return
                                       }

                                       setMaxQuantity(value);
                                   }}
                            />
                        </div>
                    )}
                </div>
                <Button
                    size="xs"
                    variant="ghost"
                    icon={<X className="size-3.5"/>}
                    iconOnly
                    onClick={onRemove}
                />
            </div>
            {cells.map((cell) => {
                return (
                    <TariffCellComponent
                        key={cell.id}
                        selectedCustomer={selectedCustomer}
                        cell={cell}
                        onPriceChange={(price) => onUpdateCell(cell.id, price)}
                    />
                );
            })}
        </div>
    );
}
