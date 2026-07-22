import { useContract, useLocale, useProduct } from "@/hooks";
import { Pen, Trash, X } from "lucide-react";
import { localized } from "@/lib/i18n-content";
import { Button } from "@/components";
import type { OfferProductInput } from "../modal-components/offer-product-form";
import { formatEur } from "@/utils/utils";
import useOfferPricing from "../../-hooks/mutations/pricing.mutations";
import { useMemo } from "react";

interface Props {
    customerId: string;
    workload: OfferProductInput;
}

export default function WorkloadItemOfferModal({ customerId, workload }: Props) {
    const locale = useLocale();

    const { product } = useProduct(workload.productId);
    const { contract } = useContract(workload.contractId);
    const { fetchPrice, isPending, error } = useOfferPricing(customerId);

    const price = useMemo(async () => {
        return await fetchPrice({
            productId: workload.productId,
            contractId: workload.contractId,
            quantity: workload.quantity,
            duration: workload.duration_months,
            customerId: customerId,
            freeMonths: workload.free_months,
        });
    }, [workload]);

    if (!product || !contract) {
        return (
            <div>dw</div>
        )
    }

    return (
        <div className="grid bg-(--subtle-50) border border-(--border) rounded-md">
            <div className="flex items-center justify-between px-4 py-3 gap-4">

                <div className="grid gap-0.5">
                    <p className="flex items-center gap-1 text-sm">
                        {workload.quantity} <X size={14} /> {localized(product.translations, locale, "name")}
                    </p>
                    <p className="text-sm text-(--text-secondary)">
                        {localized(contract.translations, locale, "name")} | {workload.duration_months} Months
                    </p>
                </div>

                <p>{formatEur(workload.total_cents)}</p>
                {isPending && (
                    <p>dwa</p>
                )}

                {/* actions */}
                <div className="flex items-center gap-2">

                    <Button variant="border" type="button" size="sm" icon={
                        <Pen size={14} />
                    } iconOnly />

                    <Button variant="border" type="button" size="sm" icon={
                        <Trash size={14} />
                    } iconOnly />

                </div>


            </div>
        </div>
    )
}