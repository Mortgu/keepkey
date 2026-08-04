import { useTranslation } from "react-i18next";
import { useOfferFilterOptions } from "../-hooks/use-offer-filter-options";
import type { OfferFilters } from "../-hooks/use-offer-filters";
import type { Contact, Customer, Product } from "@keepit/schemas";
import { useLocale } from "@/hooks";
import { MultiDropdown, SearchBar, SortDropdown } from "@/components";

interface Props {
    filters: OfferFilters;

    customers?: Array<Customer>;
    contacts?: Array<Contact>;
    products?: Array<Product>;
}

export default function OfferFilters({ filters, customers, contacts, products }: Props) {
    const { t } = useTranslation();
    const locale = useLocale();

    const {
        customerFilterOptions,
        contactPersonFilterOptions,
        productFilterOptions
    } = useOfferFilterOptions(customers ?? [], contacts ?? [], products ?? [], locale);

    return (
        <div className="flex items-center w-full gap-2">
            <SortDropdown value={filters.sort} onChange={filters.setSort} options={filters.sortOptions} />

            {customers && (
                <MultiDropdown
                    label="Kunde"
                    options={customerFilterOptions}
                    values={filters.customerFilter}
                    onChange={filters.setCustomerFilter}
                />
            )}

            {contacts && (
                <MultiDropdown
                    label="Kontakt"
                    options={contactPersonFilterOptions}
                    values={filters.contactPersonFilter}
                    onChange={filters.setContactPersonFilter}
                />
            )}

            {products && (
                <MultiDropdown
                    label="Workload"
                    options={productFilterOptions}
                    values={filters.productFilter}
                    onChange={filters.setProductFilter}
                />
            )}

            <SearchBar
                className="flex-1"
                value={filters.searchInput}
                onChange={filters.setSearchInput}
                onSubmit={() => { }}
                placeholder={t("common.search")}
            />

        </div>
    )
}