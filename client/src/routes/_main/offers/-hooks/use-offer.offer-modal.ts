import type { DropdownOption } from "@/components";
import type {
    CreateOfferInput,
    Offer
} from '@keepit/schemas';
import { useQuery } from "@tanstack/react-query";
import { useContracts, useCustomers, useLocale, useSuppliers, useUsers } from "@/hooks";
import { offerQueries } from "@/hooks/offers/offer-queries";
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

    // Beim Anlegen die nächste freie Belegnummer vorschlagen; ein bestehendes Angebot
    // behält seine. Der Vorschlag ist nicht reserviert — beim Speichern entscheidet der
    // Unique-Constraint.
    const isNewOffer = !currentOffer;
    const { data: suggestion, isLoading: isLoadingQuoteId } = useQuery({
        ...offerQueries.nextQuoteId(),
        enabled: isNewOffer,
    });

    const defaultValues: CreateOfferInput = {
        customerId: currentOffer?.customerId || preselected?.id || customers[0]?.id || "",
        contactPersonId: currentOffer?.contactPersonId || preselected?.contactPersons[0]?.id || customers[0]?.contactPersons[0]?.id || "",
        userId: currentOffer?.userId || users[0]?.id || "",
        supplierId: currentOffer?.supplierId || suppliers[0]?.id || null,
        quoteId: currentOffer?.quoteId || suggestion?.quoteId || "",
        paymentTerm: currentOffer?.paymentTerm || "30 Tage",
        validUntil: currentOffer?.validUntil || null,
        requestFrom: currentOffer?.requestFrom || null,
        language: currentOffer?.language || "DE",

        featureComparison: currentOffer?.featureComparison ?? false,
        toCompare: currentOffer?.toCompare ?? [],

        offerPositions: currentOffer?.offerPositions.map(op => ({
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
        suggestedQuoteId: suggestion?.quoteId,
        isLoadingQuoteId,
        quoteIdCloudChecked: suggestion?.cloudChecked ?? true,
    };
}
