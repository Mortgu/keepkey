import type { DropdownOption } from "@/components";
import type { Offer } from '@keepit/schemas';
import type { OfferModalValues } from "../-schemas/offer-modal-schema";
import { useContracts, useCustomers, useLocale, useSuppliers, useUsers } from "@/hooks";
import { localized } from "@/lib/i18n-content";


interface Props {
    currentOffer?: Offer;
    preselectedCustomerId?: string;
}

export default function useOfferModal({ currentOffer, preselectedCustomerId }: Props) {
    const locale = useLocale();

    const { customers } = useCustomers();
    const { users } = useUsers();
    const { suppliers } = useSuppliers();
    const { contracts } = useContracts();

    const compareOptions: Array<DropdownOption> = contracts.map(contract => ({
        value: contract.id,
        label: localized(contract.translations, locale, "name") || contract.id
    }));

    const preselected = customers.find(c => c.id === preselectedCustomerId);

    const defaultValues: OfferModalValues = {
        customerId: currentOffer?.customerId || preselected?.id || customers[0]?.id || "",
        contactPersonId: currentOffer?.contactPersonId || preselected?.contactPersons[0]?.id || customers[0]?.contactPersons[0]?.id || "",
        userId: currentOffer?.userId || users[0]?.id || "",
        supplierId: currentOffer?.supplierId || suppliers[0]?.id || null,
        quoteId: currentOffer?.quoteId || "",
        paymentTerm: currentOffer?.paymentTerm || "30 Tage",
        validUntil: currentOffer?.validUntil || null,
        requestFrom: currentOffer?.requestFrom || null,
        language: currentOffer?.language || "DE",

        featureComparison: currentOffer?.featureComparison ?? false,
        toCompare: currentOffer?.toCompare ?? [],

        offerPositions: currentOffer?.offerPositions.map(op => ({
            // Hält die Verbindung zur Quellposition — die Lizenzerweiterung
            // verweist darauf, statt die Positionsdaten selbst zu schicken.
            sourcePositionId: op.id,
            productId: op.productId,
            contractId: op.contractId,
            duration_months: op.duration_months,
            free_months: op.free_months,
            quantity: op.quantity,
            optional: op.optional,
            total_cents: op.total_cents,
            eur_user_month: op.eur_user_month,
            discount_cents: op.discount_cents,
        })) ?? [],

        flatrates: currentOffer?.offerFlatRates.map(of => ({
            flatRateId: of.flatRateId,
            quantity: of.quantity,
        })) ?? [],

        discounts: currentOffer?.offerDiscounts.map(d => ({
            title: d.title,
            description: d.description,
            amount_cents: d.amount_cents,
        })) ?? [],
    };

    return {
        compareOptions,
        defaultValues,
    };
}
