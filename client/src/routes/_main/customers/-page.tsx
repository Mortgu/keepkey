import { useTranslation } from "react-i18next";
import type { Customer } from "@keepit/schemas";
import { useModal } from "@/hooks";
import { useCustomerPage } from "./-page.hooks";
import { PageWidth } from "@/components";
import CustomerPageHeader from "./-components/header";
import CustomerPageFilters from "./-components/filter";
import CustomerModal from "./-components/customer-modal";
import CustomerList from "./-components/customer-list";

export default function CustomerPage() {
    const { t } = useTranslation();
    const modal = useModal<Customer>();

    const { filters, isPending, error, customers } = useCustomerPage();

    return (
        <PageWidth variant="none">
            <CustomerPageHeader onCreate={() => modal.open()} />
            <CustomerPageFilters filters={filters} />

            <div className="p-8">
                <CustomerList
                    filters={filters}
                    onEdit={(customer) => modal.open(customer)}
                />
            </div>

            {modal.isOpen && (
                <CustomerModal
                    key={modal.key}
                    onClose={modal.close}
                    currentCustomer={modal.data}
                />
            )}
        </PageWidth>
    );
}
