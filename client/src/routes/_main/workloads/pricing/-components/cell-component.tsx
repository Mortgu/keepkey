import { useState } from "react";
import type { ChangeEvent } from "react";
import type { TariffCell } from "@keepit/schemas";
import { useUpdateTariffCell } from "@/hooks/tariffs/tariff-mutations";
import { centsToEur, eurToCents, formatEur } from "@/utils/utils";

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
    // Eingegeben wird in Euro, gespeichert in Cent — dieselbe Richtung wie im
    // Angebotsformular. Die Zelle zeigt den Preis über formatEur ohnehin in
    // Euro an; eine Eingabe in Cent hätte hier bedeutet, dass man auf "1,00 €"
    // klickt und "100" vorfindet.
    const startEdit = () => {
        // Der Klick blubbert aus dem Input zurück auf die Zelle — ohne diesen
        // Guard würde jeder Klick ins Feld den Entwurf zurücksetzen.
        if (edit) return;

        setDraft(serverPrice === null ? "" : String(centsToEur(serverPrice)));
        setEdit(true);
    };

    const handleBlur = async () => {
        setEdit(false);

        // Komma als Dezimaltrennzeichen zulassen — deutsche Tastaturbelegung.
        const value = Number(draft.trim().replace(",", "."));
        if (draft.trim() === "" || isNaN(value) || value < 0) return;

        const cents = eurToCents(value);
        if (cents === serverPrice) return;

        await updateCell({
            groupId,
            tariffId,
            cellId: cell.id,
            default_price: cents,
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
