import type { DropdownOption } from "@/components";
import { useContracts, useCustomers, useLocale, useSuppliers, useUsers } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import type { Offer } from "@/types";

interface Props {
    currentOffer?: Offer;
}

export default function useOfferModal({ currentOffer }: Props) {
    const locale = useLocale();

    const { customers } = useCustomers();
    const { users } = useUsers();
    const { suppliers } = useSuppliers();
    const { contracts } = useContracts();

    const compareOptions: Array<DropdownOption> = contracts.map(contract => ({
        value: contract.id,
        label: localized(contract.translations, locale, "name") || contract.id
    }));

    const defaultValues = {
        customerId: currentOffer?.customerId || customers[0]?.id || "",
        contactPersonId: currentOffer?.contactPersonId || customers[0]?.contactPersons[0]?.id || "",
        userId: currentOffer?.userId || users[0]?.id || "",
        supplierId: currentOffer?.supplierId || suppliers[0]?.id || null,
        quoteId: currentOffer?.quoteId || "",
        paymentTerm: currentOffer?.paymentTerm || "30 Tage",
        validUntil: currentOffer?.validUntil || null,
        requestFrom: currentOffer?.requestFrom || null,
        language: currentOffer?.language || "DE",

        featureComparison: currentOffer?.featureComparison ?? false,
        toCompare: currentOffer?.toCompare as string[] ?? [],

        offerPositions: currentOffer?.offerPositions.map(op => ({
            productId: op.productId,
            contractId: op.contractId,
            duration_months: op.duration_months,
            free_months: op.free_months,
            quantity: op.quantity,
            optional: op.optional ?? false,
            total_cents: op.total_cents,
            eur_user_month: op.eur_user_month,
            discount_cents: op.discount_cents,
        })) ?? [],

        flatrates: currentOffer?.offerFlatRates.map(of => ({
            flatRateId: of.flatRateId,
            quantity: of.quantity,
        })) ?? [],
    };

    return {
        compareOptions,
        defaultValues,
    };
}
