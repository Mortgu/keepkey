import { useCustomerPage } from "./-page.hooks";
import CustomerPageHeader from "./-components/header";
import CustomerPageFilters from "./-components/filter";
import CustomerModal from "./-components/customer-modal";
import CustomerList from "./-components/customer-list";
import type { Customer } from "@keepit/schemas";
import { PageWidth } from "@/components";
import { useModal } from "@/hooks";

export default function CustomerPage() {
    const modal = useModal<Customer>();

    const { filters } = useCustomerPage();

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
