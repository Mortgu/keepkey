import { useMemo } from "react";
import type { ContactPerson, Customer } from "@/types";

export function useOfferFilterOptions(customers: Array<Customer>, contacts: Array<ContactPerson>) {
    const customerFilterOptions = useMemo(
        () => customers.map((c) => ({ value: c.id, label: c.companyName })),
        [customers],
    );

    const contactPersonFilterOptions = useMemo(
        () => contacts.map((cp) => ({ value: cp.id, label: `${cp.firstName} ${cp.lastName}` })),
        [contacts],
    );

    return { customerFilterOptions, contactPersonFilterOptions };
}