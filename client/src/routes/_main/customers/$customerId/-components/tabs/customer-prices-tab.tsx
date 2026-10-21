import { Trash } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { Customer, CustomerPriceRow } from "@keepit/schemas";
import { Button, RouteError, Skeleton } from "@/components";
import { useCustomerPrices, useFormatters, useLocale } from "@/hooks";
import { useDeleteCustomerPrice } from "@/hooks/pricing/pricing-mutations";
import { localized } from "@/lib/i18n-content";

interface Props {
    customer: Customer;
}

/** „ab 101–1000", „ab 5001" für die offene Staffel, „ab 11" für eine verwaiste. */
function quantityRange(row: CustomerPriceRow, t: TFunction): string {
    if (!row.reachable || row.max_quantity === null) {
        return t("customer.prices.from", { min: row.min_quantity });
    }
    return `${row.min_quantity} – ${row.max_quantity}`;
}

/**
 * Alle für diesen Kunden hinterlegten Preise.
 *
 * Sie waren bisher nirgends einsehbar: die Preistabelle zeigt Listenpreise, das
 * Angebot immer nur die eine Koordinate der bearbeiteten Position. Ausgehandelte
 * Preise ließen sich dadurch weder nachvollziehen noch zurücknehmen.
 */
export default function CustomerPricesTab({ customer }: Props) {
    const { t } = useTranslation();
    const { formatEur } = useFormatters();
    const locale = useLocale();
    const { prices, isPending, error } = useCustomerPrices(customer.id);
    const { deleteCustomerPrice, isPending: deleting, error: deleteError } = useDeleteCustomerPrice();

    if (isPending) return <Skeleton className="h-24 w-full" />;
    if (error) return <RouteError error={error} />;

    if (prices.length === 0) {
        return (
            <p className="text-sm text-(--text-secondary) py-4">
                {t("customer.prices.empty")}
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
                            <th className="px-4 py-2 font-medium">{t("customer.prices.contract")}</th>
                            <th className="px-4 py-2 font-medium">{t("customer.prices.product")}</th>
                            <th className="px-4 py-2 font-medium">{t("customer.prices.duration")}</th>
                            <th className="px-4 py-2 font-medium">{t("customer.prices.quantity")}</th>
                            <th className="px-4 py-2 font-medium text-right">{t("customer.prices.customerPrice")}</th>
                            <th className="px-4 py-2 font-medium text-right">{t("customer.prices.listPrice")}</th>
                            <th className="px-4 py-2 font-medium text-right">{t("customer.prices.deviation")}</th>
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
                                    title={row.reachable ? undefined : t("customer.prices.orphanHint")}
                                >
                                    <td className="px-4 py-2">
                                        {localized(row.contract.translations, locale, "name")}
                                    </td>

                                    <td className="px-4 py-2">
                                        {row.product
                                            ? localized(row.product.translations, locale, "name")
                                            : (
                                                <span title={t("customer.prices.allProductsHint")}>
                                                    {t("customer.prices.allProducts")}
                                                </span>
                                            )}
                                    </td>

                                    <td className="px-4 py-2">{t("customer.prices.months", { count: row.duration })}</td>

                                    <td className="px-4 py-2">
                                        <span className="flex items-center gap-2">
                                            {quantityRange(row, t)}
                                            {/* Kein `Badge`: dessen Varianten sind
                                                Dokumentstatus, nicht Preiszustände. */}
                                            {!row.reachable && (
                                                <span className="rounded-full px-2 py-0.5 text-xs bg-(--warning-subtle) text-(--warning)">
                                                    {t("customer.prices.tierMissing")}
                                                </span>
                                            )}
                                        </span>
                                    </td>

                                    <td className="px-4 py-2 text-right font-medium">{formatEur(row.price)}</td>

                                    <td className="px-4 py-2 text-right">
                                        {row.list_price === null
                                            ? <span title={t("customer.prices.noListPrice")}>–</span>
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
                                            title={t("customer.prices.remove")}
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
