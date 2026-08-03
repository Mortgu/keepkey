import { Fragment, useMemo } from "react";
import { useTranslation } from "react-i18next";
import CustomerListItem from "./customer-list-item";
import CustomerModal from "./customer-modal";

import type { Customer } from "@keepit/schemas";
import { RouteError } from "@/components";
import { useCustomers, useModal } from "@/hooks";
import { type CustomerFilters } from "../-page.hooks";

interface Props {
    filters: CustomerFilters;
    onEdit: (customer: Customer) => void;
}

export default function CustomerList({ filters, onEdit }: Props) {
    const { t } = useTranslation();
    const modal = useModal<Customer>();

    const { customers, isPending, error } = useCustomers(filters.params);

    const filteredCustomers = useMemo(() => {
        return customers.filter((c) => {
            if (filters.countryFilter.length > 0 && !filters.countryFilter.includes(c.country)) {
                return false;
            }
            if (filters.languageFilter.length > 0 && !filters.languageFilter.includes(c.language)) {
                return false;
            }
            return true;
        });
    }, [customers, filters.countryFilter, filters.languageFilter]);

    return (
        <Fragment>
            <div className="grid gap-4">
                {error && <RouteError error={error} />}

                {!error && !isPending && filteredCustomers.length === 0 && (
                    <p className="text-sm text-(--text-secondary) py-8 text-center">
                        {filters.searchInput || filters.activeFilterCount > 0
                            ? t("common.noResults")
                            : null}
                    </p>
                )}

                {!error && !isPending && filteredCustomers.map((customer) => (
                    <CustomerListItem
                        key={customer.id}
                        customer={customer}
                        onEdit={onEdit}
                    />
                ))}
            </div>

            {modal.isOpen && (
                <CustomerModal key={modal.key} onClose={modal.close} />
            )}
        </Fragment>
    );
}
