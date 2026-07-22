import type { DropdownOption } from "@/components";
import { useContracts, useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import type { Offer } from "@/types";
import { useState } from "react";

interface Props {
    currentOffer?: Offer;
}

export default function useCompareOfferModal({ currentOffer }: Props) {
    const { contracts } = useContracts();
    const locale = useLocale();

    const [compare, setCompare] = useState<boolean>(
        currentOffer?.featureComparison || false);

    const compareOptions: Array<DropdownOption> = contracts.map(contract => ({
        value: contract.id,
        label: localized(contract.translations, locale, "name") || contract.id
    }));

    const [toCompare, setToCompare] = useState<Array<string>>([]);

    return {
        compare,
        setCompare,
        compareOptions,
        toCompare,
        setToCompare
    }
}