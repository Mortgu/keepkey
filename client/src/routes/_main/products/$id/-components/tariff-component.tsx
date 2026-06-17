import {ChevronRight, Plus, Trash} from "lucide-react";
import type {Customer, Tariff, TariffColumn, TariffRow} from "@/types";
import {useTariffHook} from "@/hooks";
import {Button} from "@/components";
import {useState} from "react";
import {formatDate} from "@/lib/format.ts";
import TariffColumnComponent from "@/routes/_main/products/$id/-components/tariff-column-component.tsx";
import TariffRowComponent from "@/routes/_main/products/$id/-components/tariff-row-component.tsx";

type AddTermVars = { tariffId: string; duration: number };
type RemoveTermVars = { tariffId: string; termIndex: number };
type UpdateTermVars = { tariffId: string; termIndex: number; duration: number };

type AddBandVars = {
    tariffId: string;
    min_quantity: number;
    max_quantity: number;
    prices: Array<number>;
};
type RemoveBandVars = string;
type UpdateCellVars = { cellId: string; price: number };
type UpdateCustomerPriceVars = { cellId: string; customerId: string; price: number };

type Props = {
    tariff: Tariff;
    selectedCustomer: Customer | null;
    onAddTerm: (vars: AddTermVars) => void;
    onRemoveTerm: (vars: RemoveTermVars) => void;
    onUpdateTerm: (vars: UpdateTermVars) => void;
    onAddBand: (vars: AddBandVars) => void;
    onRemoveBand: (vars: RemoveBandVars) => void;
    onUpdateCell: (vars: UpdateCellVars) => void;
    onUpdateCustomerPrice: (vars: UpdateCustomerPriceVars) => void;
};

export default function TariffComponent(props: Props) {
    const {
        tariff,
        selectedCustomer,
        onAddTerm,
        onRemoveTerm,
        onUpdateTerm,

        onAddBand,
        onRemoveBand,
        onUpdateCell,
        onUpdateCustomerPrice,
    } = props;

    const {
        deleteTariff,
        deleteTariffPending,

        createColumn,
        createRow,
    } = useTariffHook();

    const [open, setOpen] = useState<boolean>(false);

    const addTerm = () => {
        /*const nextDuration = tariff.terms[tariff.terms.length - 1] ? tariff.terms[tariff.terms.length - 1] + 12 : 12;

        onAddTerm({
            tariffId: tariff.id,
            duration: nextDuration,
        });*/
    };

    const removeTerm = (termIndex: number) => {
        onRemoveTerm({tariffId: tariff.id, termIndex});
    };

    const updateTerm = (termIndex: number, duration: number) => {
        onUpdateTerm({tariffId: tariff.id, termIndex, duration});
    };

    const addBand = () => {
        /*const lastRow = tariff.rows[tariff.rows.length - 1];
        const minQty = lastRow ? lastRow.max_quantity + 1 : 1;
        const maxQty = minQty + 99;

        onAddBand({
            tariffId: tariff.id,
            min_quantity: minQty,
            max_quantity: maxQty,
            prices: tariff.terms.map(() => 0),
        });*/
    };


    return (
        <div className="grid bg-white border border-(--border) rounded-md shadow-xs">
            <div className="flex items-center justify-between border-b border-(--border)">
                <div onClick={() => setOpen(!open)}
                     className="w-full flex items-center gap-2 py-2 px-5 hover:bg-(--page-bg) hover:cursor-pointer border-r border-(--border)">
                    <ChevronRight className={open ? "size-4 rotate-90 transition-all" : "transition-all size-4"}/>
                    <div>
                        <h1>{tariff.id}</h1>
                        <p className="text-sm">{formatDate(tariff.createdAt)} {formatDate(tariff.updatedAt)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-2">
                    <Button onClick={() => deleteTariff({tariffId: tariff.id})}
                            loading={deleteTariffPending}
                            icon={<Trash className="size-4"/>}
                            iconOnly
                            variant="secondary"
                            size="sm"
                    />
                </div>
            </div>

            {open && (
                <div className="grid p-4 gap-2">
                    <div className="flex gap-2">
                        <div className="flex gap-2 w-full text-left">
                            {/* Rows */}
                            <div className="flex-1 grid">
                                <div/>
                                {tariff.rows.map((row: TariffRow) => (
                                    <TariffRowComponent key={row.id} tariffId={tariff.id} row={row}/>
                                ))}
                            </div>

                            {/* Columns */}
                            <div className="flex-3 flex flex-wrap items-center gap-2">
                                {tariff.columns.map((column: TariffColumn) => (
                                    <TariffColumnComponent
                                        key={column.id}
                                        tariffId={tariff.id}
                                        column={column}
                                    />
                                ))}
                            </div>
                        </div>

                        <Button className="border-dashed h-full" variant="secondary" size="xs"
                                onClick={() => createColumn({tariffId: tariff.id, duration: 1})}
                                icon={<Plus className="size-4"/>}
                        />
                    </div>

                    <Button className="border-dashed h-full w-full" variant="secondary" size="sm"
                            onClick={() => createRow({
                                tariffId: tariff.id,
                                min_qty: 1, max_qty: 100
                            })}>Create Row</Button>
                </div>
            )}
        </div>
    );
}
