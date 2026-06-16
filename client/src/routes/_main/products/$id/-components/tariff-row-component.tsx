import type {NewTariffCell, NewTariffRow} from "@/types";
import {Button} from "@/components";
import {X} from "lucide-react";
import TariffCellComponent from "@/routes/_main/products/$id/-components/tariff-cell-component.tsx";
import type {PricingMode} from "../-page";

type Props = {
    row: NewTariffRow;
    cells: Array<NewTariffCell>;
    mode: PricingMode;
    selectedCustomer: string;
    onRemove: () => void;
    onUpdateCell: (cellId: string, price: number) => void;
};

export default function TariffRowComponent(props: Props) {
    const {
        row,
        cells,
        mode,
        selectedCustomer,
        onRemove,
        onUpdateCell,
    } = props;

    return (
        <div className="flex gap-2">
            <div className="w-full max-w-50 flex items-center justify-between gap-2">
                <p className="flex-1flex items-center justify-start">
                    {row.min_quantity} - {row.max_quantity}
                </p>
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
                        mode={mode}
                        selectedCustomer={selectedCustomer}
                        cell={cell}
                        onPriceChange={(price) => onUpdateCell(cell.id, price)}
                    />
                );
            })}
        </div>
    );
}
