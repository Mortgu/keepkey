import { useState } from "react";
import type { ChangeEvent } from "react";
import type { TariffCell } from "@keepit/schemas";
import { useUpdateTariffCell } from "@/hooks/tariffs/tariff-mutations";
import { formatEur } from "@/utils/utils";

interface Props {
    groupId: string;
    tariffId: string;
    cell: TariffCell;
}

export default function TariffCellComponent({ groupId, tariffId, cell }: Props) {
    // Neue Zellen entstehen ohne Default-Preis und bleiben unkonfiguriert,
    // bis hier ein Wert eingetragen wird. `.at(0)` statt `[0]`, weil das Array
    // tatsächlich leer sein kann — Index-Zugriff würde das wegtypisieren.
    const defaultCell = cell.default_cells.at(0);
    const serverPrice = defaultCell === undefined ? null : defaultCell.price;

    const [edit, setEdit] = useState<boolean>(false);
    const [draft, setDraft] = useState<string>("");

    const { updateCell } = useUpdateTariffCell();

    // Der angezeigte Wert kommt aus den Props, nicht aus lokalem State — sonst
    // zeigt das Grid nach einem Restore weiterhin die alten Preise.
    const startEdit = () => {
        // Der Klick blubbert aus dem Input zurück auf die Zelle — ohne diesen
        // Guard würde jeder Klick ins Feld den Entwurf zurücksetzen.
        if (edit) return;

        setDraft(serverPrice === null ? "" : String(serverPrice));
        setEdit(true);
    };

    const handleBlur = async () => {
        setEdit(false);

        const value = Number(draft);
        if (draft.trim() === "" || isNaN(value) || value < 0) return;
        if (value === serverPrice) return;

        await updateCell({
            groupId,
            tariffId,
            cellId: cell.id,
            default_price: value,
        });
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => setDraft(e.target.value);

    return (
        <td className="relative border border-(--border) px-3 py-1" onClick={startEdit}>
            {edit && (
                <input className="absolute inset-3 w-fit box-border" type="text" value={draft}
                    autoFocus onBlur={handleBlur} onChange={handleChange} />
            )}
            {!edit && serverPrice !== null && (
                <p className="text-sm font-normal">{formatEur(serverPrice)}</p>
            )}
            {!edit && serverPrice === null && (
                <p className="text-sm font-normal text-gray-400" title="Kein Preis hinterlegt">–</p>
            )}
        </td>
    )
}
