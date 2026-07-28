import { useStore } from "@tanstack/react-form";
import { MoveRight } from "lucide-react";
import type { OfferFlatrate } from "@keepit/schemas";
import type { RenewalFormApi } from "../hook/use-renewal-form";
import { Input } from "@/components";
import { useFlatRates, useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { formatEur } from "@/utils/utils";

interface Props {
    form: RenewalFormApi;
    index: number;
    originalFlatrate: OfferFlatrate;
}

export default function FlatrateItemRenewalModal({ form, index, originalFlatrate }: Props) {
    const locales = useLocale();
    const { flatRates: availableFlatRates } = useFlatRates();

    const flatrate = useStore(form.store, (s) => s.values.flatrates[index]);

    const source = availableFlatRates.find((item) => item.id === flatrate.flatRateId);
    const unitCents = originalFlatrate.flatRate.total_cents;
    const totalCents = unitCents * flatrate.quantity;
    const totalChanged = originalFlatrate.quantity !== flatrate.quantity;

    return (
        <div className="border border-(--border) rounded-md overflow-hidden">
            <div className="flex items-center justify-between bg-(--subtle-50) px-4 py-3">
                <div className="grid">
                    <p className="font-normal">
                        {source ? localized(source.translations, locales, "name") : "—"}
                    </p>
                </div>

                <div className="relative divide-x divide-(--border) flex items-center">
                    <div className="flex-1 min-w-fit grid items-center px-4 last:pr-0">
                        <span className="text-xs text-gray-500">Stück</span>
                        <div className="flex items-center gap-2">
                            {totalChanged && (
                                <>
                                    <span className="text-md font-mono font-normal line-through">{originalFlatrate.quantity}</span>
                                    <MoveRight size={14} className="text-gray-500" />
                                </>
                            )}
                            <span className="text-md font-mono font-normal">{flatrate.quantity}</span>
                        </div>
                    </div>
                    <div className="flex-1 min-w-fit grid items-center px-4 last:pr-0">
                        <span className="text-xs text-gray-500">Total</span>
                        <div className="flex items-center gap-2">
                            {totalChanged && (
                                <>
                                    <span className="text-md font-mono font-normal line-through">{formatEur(originalFlatrate.total_cents)}</span>
                                    <MoveRight size={14} className="text-gray-500" />
                                </>
                            )}
                            <span className="text-md font-mono font-normal">{formatEur(totalCents)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-end gap-4 border-t border-(--border) p-4">
                <Input
                    label="Menge"
                    type="number"
                    min={1}
                    value={flatrate.quantity}
                    onChange={(e) => {
                        const quantity = Math.max(1, Number(e.target.value));
                        form.setFieldValue(`flatrates[${index}]`, {
                            ...flatrate,
                            quantity,
                        });
                    }}
                />
            </div>
        </div>
    );
}