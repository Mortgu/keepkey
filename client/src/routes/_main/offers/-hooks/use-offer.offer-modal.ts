import type { DropdownOption } from "@/components";
import { useContracts, useCustomers, useLocale, useSuppliers, useUsers } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import type { Language, Offer } from "@/types";
import { useState } from "react";

interface Props {
    currentOffer?: Offer;
}

export default function useOfferModal({ currentOffer }: Props) {
    const locale = useLocale();

    const { customers } = useCustomers();
    const { users } = useUsers();
    const { suppliers } = useSuppliers();
    const { contracts } = useContracts();

    const [customer, setCustomer] = useState<string>(
        currentOffer?.customerId || customers[0].id || "");

    const [contact, setContact] = useState<string>(
        currentOffer?.customerContactPerson.id || customers[0]?.contactPersons[0].id || "");

    const [employee, setEmployee] = useState<string>(
        currentOffer?.userId || users[0]?.id || "");

    const [supplier, setSupplier] = useState<string | null>(
        currentOffer?.supplierId || suppliers[0]?.id || "");

    const [language, setLanguage] = useState<Language>(
        currentOffer?.language || "DE");

    const [quoteId, setQuoteId] = useState<string>(currentOffer?.quoteId || "");

    const [paymentTerm, setPaymentTerm] = useState<string>(currentOffer?.paymentTerm || "30 Tage");
    const [validUntil, setValidUntil] = useState<string | null>(currentOffer?.validUntil || null);
    const [requestFrom, setRequestFrom] = useState<string | null>(currentOffer?.requestFrom || null);

    const [compare, setCompare] = useState<boolean>(
        currentOffer?.featureComparison || false);

    const [toCompare, setToCompare] = useState<Array<string>>([]);

    const compareOptions: Array<DropdownOption> = contracts.map(contract => ({
        value: contract.id,
        label: localized(contract.translations, locale, "name") || contract.id
    }));

    return {
        compare,
        setCompare,
        toCompare,
        setToCompare,
        compareOptions,

        defaultValues: {
            customerId: customer,
            contactPersonId: contact,
            userId: employee,
            supplierId: supplier,
            quoteId: quoteId,
            paymentTerm: paymentTerm,
            validUntil: validUntil,
            requestFrom: requestFrom,
            language: language,

            featureComparison: compare,
            toCompare: toCompare,

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
        }
    }
}