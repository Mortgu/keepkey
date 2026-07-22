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
        currentOffer?.customer.id || customers[0].id || "");

    const [contact, setContact] = useState<string>(
        currentOffer?.customerContactPerson.id || customers[0]?.contactPersons[0].id || "");

    const [employee, setEmployee] = useState<string>(
        currentOffer?.user?.id || users[0]?.id || "");

    const [supplier, setSupplier] = useState<string | null>(
        currentOffer?.supplier?.id || suppliers[0]?.id || "");

    const [language, setLanguage] = useState<Language>(
        currentOffer?.language || "DE");

    const [quoteId, setQuoteId] = useState<string>(currentOffer?.quoteId || "");

    const [paymentTerm, setPaymentTerm] = useState<string | null>(currentOffer?.paymentTerm || "30 Tage");
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
        }
    }
}