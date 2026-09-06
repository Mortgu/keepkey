import { useTranslation } from "react-i18next";
import { useCustomerPage } from "./-page.hooks";
import CustomerModal from "./-components/customer-modal";
import CustomerList from "./-components/customer-list";
import type { Customer } from "@keepit/schemas";
import { Breadcrumbs, Button, MultiDropdown } from "@/components";
import { useCustomers, useModal } from "@/hooks";
import { COUNTRY_OPTIONS, LANGUAGE_OPTIONS } from "@/lib/countries";
import CustomerAutocomplete, { type CustomerFuzzyItem } from "./-components/customer-autocomplete";

export default function CustomerPage() {
    const { t } = useTranslation();
    const modal = useModal<Customer>();

    const { filters } = useCustomerPage();
    const { customers } = useCustomers(filters.params);

    const customerItems: Array<CustomerFuzzyItem> = customers.map(customer => ({
        title: customer.companyName,
        description: customer.contactPersons.map(cp => `${cp.firstName} ${cp.lastName}`).join(', '),
    }));

    return (
        <div className="grid gap-4 mx-4">
            <div className="flex items-center justify-between gap-4 border-b border-(--border) h-14">
                <Breadcrumbs
                    size="sm"
                    maxItems={4}
                    items={[
                        { label: "Dashboard", to: "/" },
                        { label: t("section.customers"), to: "/customers" },
                    ]}
                />
            </div>

            <div className="w-full flex items-center gap-2">
                <MultiDropdown
                    label={t("common.country")}
                    options={COUNTRY_OPTIONS}
                    values={filters.countryFilter}
                    onChange={filters.setCountryFilter}
                />

                <MultiDropdown
                    label={t('common.language')}
                    options={LANGUAGE_OPTIONS}
                    values={filters.languageFilter}
                    onChange={filters.setLanguageFilter}
                />

                <CustomerAutocomplete
                    items={customerItems}
                    filters={filters}
                />

                <Button size="sm" onClick={() => modal.open()}>
                    {t("customer.create")}
                </Button>
            </div>

            <CustomerList
                filters={filters}
                onEdit={(customer) => modal.open(customer)}
            />

            {modal.isOpen && (
                <CustomerModal
                    key={modal.key}
                    onClose={modal.close}
                    currentCustomer={modal.data}
                />
            )}
        </div>
    );
}
