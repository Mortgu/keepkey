import { Trash } from "lucide-react";
import { useState } from "react";
import { Button, NumberField } from "@/components";
import { useDeleteTariffRow, useUpdateTariffRow } from "@/hooks/tariffs/tariff-mutations";

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

    const { deleteRow } = useDeleteTariffRow();
    const { updateRow } = useUpdateTariffRow();

    // Gespeichert wird über `onValueCommitted`, nicht im Blur-Handler: base-ui
    // parst den getippten Text erst in seinem eigenen Blur-Handler, der nach dem
    // externen läuft — der externe Handler läse also noch den alten Wert.
    const handleMinCommit = async (committed: number | null) => {
        if (committed === null || committed === minQty) return;

        setMin(committed);
        await updateRow({ groupId, tariffId, rowId, min_quantity: committed, max_quantity: max });
    };

    // Ein leeres Feld ist hier kein Fehler, sondern die offene Staffel ("∞") —
    // `NumberField` liefert dafür `null`.
    const handleMaxCommit = async (committed: number | null) => {
        if (committed === maxQty) return;

        setMax(committed);
        await updateRow({ groupId, tariffId, rowId, min_quantity: min, max_quantity: committed });
    };

    return (
        <td className="border-b border-r border-(--border)">
            <div className="flex-1 min-w-fit w-full flex flex-wrap items-center px-3 py-1">
                <div className="flex-1 flex items-center gap-3">
                    <div className="relative max-w-fit box-border">
                        <p onClick={() => setEditMin(true)}>{min}</p>
                        {editMin && (
                            <div className="absolute top-1/2 left-0 w-24 -translate-y-1/2">
                                <NumberField size="xs" hideSteppers autoFocus min={1} step={1}
                                    value={min} onValueChange={(v) => setMin(v ?? minQty)}
                                    onValueCommitted={handleMinCommit} onBlur={() => setEditMin(false)} />
                            </div>
                        )}
                    </div>
                    -
                    <div className="relative max-w-fit box-border">
                        <p onClick={() => setEditMax(true)}>{max ?? "∞"}</p>
                        {editMax && (
                            <div className="absolute top-1/2 left-0 w-24 -translate-y-1/2">
                                <NumberField size="xs" hideSteppers autoFocus min={1} step={1}
                                    placeholder="∞"
                                    value={max} onValueChange={(v) => setMax(v)}
                                    onValueCommitted={handleMaxCommit} onBlur={() => setEditMax(false)} />
                            </div>
                        )}
                    </div>
                </div>
                <Button variant="link" size="xs" icon={<Trash className="size-3" />} iconOnly
                    onClick={() => deleteRow({ groupId, tariffId, rowId })} />
            </div>
        </td>
    );
}
