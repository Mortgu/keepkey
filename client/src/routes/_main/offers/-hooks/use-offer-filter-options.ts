import { useMemo } from "react";
import type { ContactPerson, Customer, Language, Product } from "@/types";
import { localized } from "@/lib/i18n-content";

export function useOfferFilterOptions(
    customers: Array<Customer>,
    contacts: Array<ContactPerson>,
    products: Array<Product>,
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