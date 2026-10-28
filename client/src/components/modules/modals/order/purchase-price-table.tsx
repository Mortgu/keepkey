import { useTranslation } from "react-i18next";
import type { PurchaseRow, PurchaseValue } from "./_hooks/use-order-form";
import { Input } from "@/components";
import { useFormatters, useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { centsToEur, eurToCents } from "@/utils/utils";

interface Props {
    rows: Array<PurchaseRow>;
    /** Gesamtbetrag je Position in Cent, `null` solange nicht eingegeben. */
    values: Array<PurchaseValue>;
    onChange: (offerPositionId: string, totalCents: number | null) => void;
    disabled?: boolean;
    /** Fehlende Beträge markieren — erst nach einem Absendeversuch. */
    showMissing?: boolean;
}

/** Einzelpreis je User/Monat, nur zur Anzeige. Gleiche Rundung wie der Server. */
const unitOf = (row: PurchaseRow, totalCents: number) =>
    row.quantity > 0 && row.duration_months > 0 ? Math.round(totalCents / (row.quantity * row.duration_months)) : 0;

/**
 * Einkaufsbeträge der Bestellung an den Zulieferer. Eingegeben wird der
 * Gesamtbetrag je Position; der Einzelpreis ist daraus abgeleitet. Pauschalen
 * und Rabatte des Angebots fehlen bewusst — sie haben keinen Einkaufspreis.
 */
export default function PurchasePriceTable({ rows, values, onChange, disabled, showMissing }: Props) {
    const { formatEur } = useFormatters();
    const { t } = useTranslation();
    const locale = useLocale();

    const totalOf = (id: string) =>
        values.find((v) => v.offerPositionId === id)?.purchase_total_cents ?? null;

    const purchase = rows.reduce((sum, row) => sum + (totalOf(row.offerPositionId) ?? 0), 0);

    return (
        <div className="grid gap-2">
            <p className="text-sm font-medium">{t("orders.purchase.title")}</p>
            <p className="text-sm text-(--text-secondary)">{t("orders.purchase.hint")}</p>

            <table className="w-full text-sm">
                <thead className="text-(--text-secondary) font-normal">
                    <tr className="text-left">
                        <th className="py-1 font-normal">{t("orders.purchase.product")}</th>
                        <th className="py-1 font-normal text-right">{t("orders.purchase.quantity")}</th>
                        <th className="py-1 font-normal text-right">{t("orders.purchase.unitPrice")}</th>
                        <th className="py-1 font-normal text-right w-40">{t("orders.purchase.lineTotal")}</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => {
                        const total = totalOf(row.offerPositionId);
                        return (
                            <tr key={row.offerPositionId} className="border-t border-(--border)">
                                <td className="py-2">{localized(row.productName, locale, "name")}</td>
                                <td className="py-2 text-right font-mono">{row.quantity}</td>
                                <td className="py-2 text-right font-mono text-(--text-secondary)">
                                    {total === null ? "—" : formatEur(unitOf(row, total))}
                                </td>
                                <td className="py-2 text-right">
                                    <Input
                                        id={`purchase-${row.offerPositionId}`}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        suffix="€"
                                        placeholder="0,00"
                                        value={total === null ? "" : centsToEur(total)}
                                        error={showMissing && total === null ? t("orders.purchase.required") : undefined}
                                        disabled={disabled}
                                        onChange={(e) => onChange(
                                            row.offerPositionId,
                                            e.target.value === "" ? null : eurToCents(Number(e.target.value) || 0),
                                        )}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot className="border-t border-(--border)">
                    <tr>
                        <td colSpan={3} className="py-1 text-right text-(--text-secondary)">{t("orders.purchase.purchaseTotal")}</td>
                        <td className="py-1 text-right font-mono font-medium">{formatEur(purchase)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}
