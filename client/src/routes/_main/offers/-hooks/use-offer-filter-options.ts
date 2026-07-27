import { useMemo } from "react";
import { localized } from "@/lib/i18n-content";

import type {
    ContactList,
    CustomerList,
    ProductList,
    Language
} from "@keepit/schemas";

export function useOfferFilterOptions(
    customers: CustomerList,
    contacts: ContactList,
    products: ProductList,
    locale: Language,
) {
    const customerFilterOptions = useMemo(
        () => customers.map((c) => ({ value: c.id, label: c.companyName })),
        [customers],
    );

    const contactPersonFilterOptions = useMemo(
        () => contacts.map((cp) => ({ value: cp.id, label: `${cp.firstName} ${cp.lastName}` })),
        [contacts],
    );

    const productFilterOptions = useMemo(
        () => products.map((p) => ({ value: p.id, label: localized(p.translations, locale, "name") })),
        [products, locale],
    );

    return { customerFilterOptions, contactPersonFilterOptions, productFilterOptions };
}