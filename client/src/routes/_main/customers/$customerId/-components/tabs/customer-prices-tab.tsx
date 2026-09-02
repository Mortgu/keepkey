import { Trash } from "lucide-react";
import type { Customer, CustomerPriceRow } from "@keepit/schemas";
import { Button, RouteError, Skeleton } from "@/components";
import { useCustomerPrices, useLocale } from "@/hooks";
import { useDeleteCustomerPrice } from "@/hooks/pricing/pricing-mutations";
import { localized } from "@/lib/i18n-content";
import { formatEur } from "@/utils/utils";

interface Props {
    customer: Customer;
}

const ORPHAN_HINT =
    "Diese Mengenstufe steht nicht in den Standard-Staffeln. Der Preis bleibt erhalten, "
    + "greift aber nicht — es gibt keine Menge mehr, die ihn trifft.";

/** „ab 101–1000", „ab 5001" für die offene Staffel, „ab 11" für eine verwaiste. */
function quantityRange(row: CustomerPriceRow): string {
    if (!row.reachable) return `ab ${row.min_quantity}`;
    return row.max_quantity === null
        ? `ab ${row.min_quantity}`
        : `${row.min_quantity} – ${row.max_quantity}`;
}

/**
 * Alle für diesen Kunden hinterlegten Preise.
 *
 * Sie waren bisher nirgends einsehbar: die Preistabelle zeigt Listenpreise, das
 * Angebot immer nur die eine Koordinate der bearbeiteten Position. Ausgehandelte
 * Preise ließen sich dadurch weder nachvollziehen noch zurücknehmen.
 */
export default function CustomerPricesTab({ customer }: Props) {
    const locale = useLocale();
    const { prices, isPending, error } = useCustomerPrices(customer.id);
    const { deleteCustomerPrice, isPending: deleting, error: deleteError } = useDeleteCustomerPrice();

    if (isPending) return <Skeleton className="h-24 w-full" />;
    if (error) return <RouteError error={error} />;

    if (prices.length === 0) {
        return (
            <p className="text-sm text-(--text-secondary) py-4">
                Für diesen Kunden ist kein eigener Preis hinterlegt — es gelten die Listenpreise.
            </p>
        );
    }

    return (
        <div className="grid gap-3">
            {deleteError && <RouteError error={deleteError} />}

            <div className="border border-(--border) rounded-md overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-(--page-bg) border-b border-(--border) text-left">
                        <tr>
                            <th className="px-4 py-2 font-medium">Vertrag</th>
                            <th className="px-4 py-2 font-medium">Produkt</th>
                            <th className="px-4 py-2 font-medium">Laufzeit</th>
                            <th className="px-4 py-2 font-medium">Menge</th>
                            <th className="px-4 py-2 font-medium text-right">Kundenpreis</th>
                            <th className="px-4 py-2 font-medium text-right">Listenpreis</th>
                            <th className="px-4 py-2 font-medium text-right">Abweichung</th>
                            <th className="px-4 py-2" />
                        </tr>
                    </thead>

                    <tbody>
                        {prices.map(row => {
                            const deviation = row.list_price === null
                                ? null
                                : row.price - row.list_price;

                            return (
                                <tr
                                    key={row.id}
                                    className={`border-b border-(--border) last:border-0 tabular-nums ${row.reachable ? "" : "text-(--text-secondary)"}`}
                                    title={row.reachable ? undefined : ORPHAN_HINT}
                                >
                                    <td className="px-4 py-2">
                                        {localized(row.contract.translations, locale, "name")}
                                    </td>

                                    <td className="px-4 py-2">
                                        {row.product
                                            ? localized(row.product.translations, locale, "name")
                                            : (
                                                <span title="Altbestand: gilt für jedes Produkt der Tarifgruppe.">
                                                    alle Produkte der Gruppe
                                                </span>
                                            )}
                                    </td>

                                    <td className="px-4 py-2">{row.duration} Monate</td>

                                    <td className="px-4 py-2">
                                        <span className="flex items-center gap-2">
                                            {quantityRange(row)}
                                            {/* Kein `Badge`: dessen Varianten sind
                                                Dokumentstatus, nicht Preiszustände. */}
                                            {!row.reachable && (
                                                <span className="rounded-full px-2 py-0.5 text-xs bg-(--warning-subtle) text-(--warning)">
                                                    Staffel fehlt
                                                </span>
                                            )}
                                        </span>
                                    </td>

                                    <td className="px-4 py-2 text-right font-medium">{formatEur(row.price)}</td>

                                    <td className="px-4 py-2 text-right">
                                        {row.list_price === null
                                            ? <span title="An dieser Koordinate ist kein Listenpreis hinterlegt — der Kundenpreis steht allein.">–</span>
                                            : formatEur(row.list_price)}
                                    </td>

                                    <td className="px-4 py-2 text-right">
                                        {deviation === null
                                            ? "–"
                                            : `${deviation > 0 ? "+" : ""}${formatEur(deviation)}`}
                                    </td>

                                    <td className="px-4 py-2 text-right">
                                        <Button
                                            variant="link"
                                            size="xs"
                                            iconOnly
                                            icon={<Trash className="size-3.5" />}
                                            title="Kundenpreis entfernen — danach gilt wieder der Listenpreis."
                                            disabled={deleting}
                                            onClick={() => void deleteCustomerPrice(row.id)}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
