import { useState } from "react";
import { useUpdateTariffCell } from "@/hooks/tariffs/tariff-mutations";
import { NumberField } from "@/components";
import { centsToEur, eurToCents, formatEur } from "@/utils/utils";

interface Props {
    groupId: string;
    tariffId: string;
    duration: number;
    minQuantity: number;
    /** `null`, solange für diese Koordinate kein Preis hinterlegt ist. */
    price: number | null;
}

/**
 * Ein Preis an seiner Koordinate. Es gibt keine „leere Zelle" mehr als Datensatz —
 * fehlt der Preis, existiert schlicht keine Zeile, und das Eintragen legt sie an.
 */
export default function TariffCellComponent({ groupId, tariffId, duration, minQuantity, price }: Props) {
    const [edit, setEdit] = useState<boolean>(false);
    const [draft, setDraft] = useState<number | null>(null);

    const { updateCell } = useUpdateTariffCell();

    // Eingegeben wird in Euro, gespeichert in Cent — dieselbe Richtung wie im
    // Angebotsformular. Die Zelle zeigt den Preis über formatEur ohnehin in
    // Euro an; eine Eingabe in Cent hätte hier bedeutet, dass man auf "1,00 €"
    // klickt und "100" vorfindet.
    const startEdit = () => {
        // Der Klick blubbert aus dem Input zurück auf die Zelle — ohne diesen
        // Guard würde jeder Klick ins Feld den Entwurf zurücksetzen.
        if (edit) return;

        setDraft(price === null ? null : centsToEur(price));
        setEdit(true);
    };

    // Gespeichert wird über `onValueCommitted`, nicht im Blur-Handler: base-ui
    // parst den getippten Text erst in seinem eigenen Blur-Handler, der nach dem
    // externen läuft. Das Dezimalkomma übernimmt `NumberField` über die UI-Sprache.
    const handleCommit = async (committed: number | null) => {
        if (committed === null || committed < 0) return;

        const cents = eurToCents(committed);
        if (cents === price) return;

        await updateCell({ groupId, tariffId, duration, min_quantity: minQuantity, default_price: cents });
    };

    return (
        <td className="relative border border-(--border) px-3 py-1" onClick={startEdit}>
            {edit && (
                <div className="absolute inset-0 flex items-center px-1">
                    <NumberField size="xs" hideSteppers autoFocus min={0} step={0.01}
                        format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                        suffix="€"
                        value={draft} onValueChange={(v) => setDraft(v)}
                        onValueCommitted={handleCommit} onBlur={() => setEdit(false)} />
                </div>
            )}
            {!edit && price !== null && (
                <p className="text-sm font-normal">{formatEur(price)}</p>
            )}
            {!edit && price === null && (
                <p className="text-sm font-normal text-(--text-secondary)" title="Kein Preis hinterlegt">–</p>
            )}
        </td>
    )
}
