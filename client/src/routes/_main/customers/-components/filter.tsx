import type { CustomerFilters } from "../-page.hooks";
import { MultiDropdown } from "@/components";
import { COUNTRY_OPTIONS, LANGUAGE_OPTIONS } from "@/lib/countries";
import CustomerAutocomplete, { type CustomerFuzzyItem } from "./customer-autocomplete";
import type { Customer } from "@keepit/schemas";

interface Props {
    filters: CustomerFilters;
    customers: Array<Customer>;
}

export default function CustomerPageFilters({ filters, customers }: Props) {
    const customerItems: Array<CustomerFuzzyItem> = customers.map(customer => ({
        title: customer.companyName,
        description: customer.contactPersons.map(cp => `${cp.firstName} ${cp.lastName}`).join(', '),
    }))

    return (
        <div className="flex items-center justify-between gap-4 border-b border-(--border) p-4 px-8">
            <div className="flex items-center gap-2 flex-1">
                <MultiDropdown
                    label="Land"
                    options={COUNTRY_OPTIONS}
                    values={filters.countryFilter}
                    onChange={filters.setCountryFilter}
                />

                <MultiDropdown
                    label="Sprache"
                    options={LANGUAGE_OPTIONS}
                    values={filters.languageFilter}
                    onChange={filters.setLanguageFilter}
                />

                <CustomerAutocomplete
                    items={customerItems}
                    filters={filters}
                />
            </div>
        </div>
    )
}