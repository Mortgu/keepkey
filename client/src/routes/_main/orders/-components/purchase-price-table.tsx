import { useTranslation } from "react-i18next";
import type { PurchaseRow } from "../-hooks/use-order-form";
import { Input } from "@/components";
import { useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { centsToEur, eurToCents, formatEur } from "@/utils/utils";

interface Props {
    rows: Array<PurchaseRow>;
    /** Einkaufspreis je Position in Cent, Reihenfolge wie `rows`. */
    values: Array<{ offerPositionId: string; purchase_eur_user_month: number }>;
    onChange: (offerPositionId: string, purchaseCents: number) => void;
    disabled?: boolean;
}

/** Netto einer Zeile: Preis × Menge × (Laufzeit − Freimonate). Gleiche Formel wie der Server. */
const lineNet = (row: PurchaseRow, unitCents: number) =>
    unitCents * row.quantity * (row.duration_months - row.free_months);

/**
 * Einkaufspreise der Bestellung an den Zulieferer. Verkaufspreis daneben zum
 * Vergleich, Marge unten. Pauschalen und Rabatte des Angebots fehlen bewusst —
 * sie haben keinen Einkaufspreis.
 */
export default function PurchasePriceTable({ rows, values, onChange, disabled }: Props) {
    const { t } = useTranslation();
    const locale = useLocale();

    const purchaseOf = (id: string) =>
        values.find((v) => v.offerPositionId === id)?.purchase_eur_user_month ?? 0;

    const sales = rows.reduce((sum, row) => sum + lineNet(row, row.eur_user_month), 0);
    const purchase = rows.reduce((sum, row) => sum + lineNet(row, purchaseOf(row.offerPositionId)), 0);
    const margin = sales - purchase;

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
                        <th className="py-1 font-normal text-right w-36">{t("orders.purchase.purchase")}</th>
                        <th className="py-1 font-normal text-right">{t("orders.purchase.lineTotal")}</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => {
                        const unit = purchaseOf(row.offerPositionId);
                        return (
                            <tr key={row.offerPositionId} className="border-t border-(--border)">
                                <td className="py-2">{localized(row.productName, locale, "name")}</td>
                                <td className="py-2 text-right font-mono">{row.quantity}</td>
                                <td className="py-2 text-right font-mono">{formatEur(row.eur_user_month)}</td>
                                <td className="py-2 text-right">
                                    <Input
                                        id={`purchase-${row.offerPositionId}`}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        suffix="€"
                                        value={centsToEur(unit)}
                                        disabled={disabled}
                                        onChange={(e) => onChange(row.offerPositionId, eurToCents(Number(e.target.value) || 0))}
                                    />
                                </td>
                                <td className="py-2 text-right font-mono">{formatEur(lineNet(row, unit))}</td>
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot className="border-t border-(--border)">
                    <tr>
                        <td colSpan={4} className="py-1 text-right text-(--text-secondary)">{t("orders.purchase.salesTotal")}</td>
                        <td className="py-1 text-right font-mono">{formatEur(sales)}</td>
                    </tr>
                    <tr>
                        <td colSpan={4} className="py-1 text-right text-(--text-secondary)">{t("orders.purchase.purchaseTotal")}</td>
                        <td className="py-1 text-right font-mono font-medium">{formatEur(purchase)}</td>
                    </tr>
                    <tr>
                        <td colSpan={4} className="py-1 text-right text-(--text-secondary)">{t("orders.purchase.margin")}</td>
                        <td className={`py-1 text-right font-mono ${margin < 0 ? "text-(--destructive)" : ""}`}>{formatEur(margin)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}
