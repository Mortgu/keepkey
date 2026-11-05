import {useState} from "react";
import {useTranslation} from "react-i18next";
import type {PurchaseRow} from "../-hooks/use-order-form";
import {NumberField} from "@/components";
import {useFormatters, useLocale} from "@/hooks";
import {localized} from "@/lib/i18n-content";
import {centsToEur, eurToCents} from "@/utils/utils";

interface Props {
    rows: Array<PurchaseRow>;
    /** Einkaufspreis je Position in Cent, Reihenfolge wie `rows`. */
    values: Array<{ offerPositionId: string; purchase_eur_user_month: number }>;
    onChange: (offerPositionId: string, purchaseCents: number) => void;
    disabled?: boolean;
}

/** Netto einer Zeile: Preis × Menge × (Laufzeit − Freimonate). Gleiche Formel wie der Server. */
const billableUnits = (row: PurchaseRow) => row.quantity * (row.duration_months - row.freeMonths);
const lineNet = (row: PurchaseRow, unitCents: number) => unitCents * billableUnits(row);

/** Umkehrung von `lineNet`: Stückpreis je User und Monat aus dem Zeilenbetrag. */
const unitFromNet = (row: PurchaseRow, netCents: number) => {
    const units = billableUnits(row);
    return units > 0 ? Math.round(netCents / units) : 0;
};

/**
 * Einkaufspreise der Bestellung an den Zulieferer. Eingegeben wird der
 * Netto-Gesamtbetrag je Zeile, gespeichert der daraus abgeleitete Preis je User
 * und Monat. Verkaufspreis daneben zum
 * Vergleich, Marge unten. Pauschalen und Rabatte des Angebots fehlen bewusst —
 * sie haben keinen Einkaufspreis.
 */
export default function PurchasePriceTable({rows, values, onChange, disabled}: Props) {
    const {formatEur} = useFormatters();
    const {t} = useTranslation();
    const locale = useLocale();

    /* Getippter Zeilenbetrag, solange das Feld fokussiert ist. Sonst würde der aus dem
       gerundeten Stückpreis zurückgerechnete Betrag die Eingabe beim Tippen überschreiben. */
    const [drafts, setDrafts] = useState<Record<string, number>>({});
    const clearDraft = (id: string) => setDrafts((d) => {
        const next = {...d};
        delete next[id];
        return next;
    });

    const purchaseOf = (id: string) =>
        values.find((v) => v.offerPositionId === id)?.purchase_eur_user_month ?? 0;

    return (
        <div className="grid gap-2">
            <p className="text-sm font-medium">{t("orders.purchase.title")}</p>
            <p className="text-sm text-(--text-secondary)">{t("orders.purchase.hint")}</p>

            <table className="w-full text-sm">
                <thead className="text-(--text-secondary) font-normal">
                <tr className="text-left">
                    <th className="py-1 font-normal">{t("orders.purchase.product")}</th>
                    <th className="py-1 font-normal text-right">{t("orders.purchase.quantity")}</th>
                    <th className="py-1 font-normal text-right">{t("orders.purchase.sales")}</th>
                    <th className="py-1 font-normal text-right">{t("orders.purchase.purchase")}</th>
                    <th className="py-1 font-normal text-right w-40">{t("orders.purchase.lineTotal")}</th>
                </tr>
                </thead>
                <tbody>
                {rows.map((row) => {
                    const unit = purchaseOf(row.offerPositionId);
                    return (
                        <tr key={row.offerPositionId} className="border-t border-(--border)">
                            <td className="py-2">{localized(row.productName, locale, "name")}</td>
                            <td className="ml-4 py-2 text-right font-mono">{row.quantity}</td>
                            <td className="py-2 text-right font-mono">{formatEur(row.unitCents)}</td>
                            <td className="py-2 text-right font-mono">{formatEur(unit)}</td>
                            <td className="ml-4 py-2 text-right">
                                <NumberField
                                    id={`purchase-${row.offerPositionId}`}
                                    type="number"
                                    step="1"
                                    min="0"
                                    suffix="€"
                                    value={centsToEur(drafts[row.offerPositionId] ?? lineNet(row, unit))}
                                    disabled={disabled || billableUnits(row) <= 0}
                                    onValueChange={(value) => {
                                        const netCents = eurToCents(Number(value) || 0);
                                        setDrafts((d) => ({...d, [row.offerPositionId]: netCents}));
                                        onChange(row.offerPositionId, unitFromNet(row, netCents));
                                    }}
                                    onBlur={() => clearDraft(row.offerPositionId)}
                                />
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}
