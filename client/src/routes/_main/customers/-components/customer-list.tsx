import {useTranslation} from "react-i18next";
import CustomerListItem from "./customer-list-item";
import CustomerModal from "./customer-modal";

import {ListPage} from "@/components";
import {useCustomers, useModal} from "@/hooks";

export default function CustomerList() {
    const {t} = useTranslation();

    const modal = useModal();
    const {customers, isPending, error} = useCustomers();

    return (
        <ListPage
            title={t("section.customers")}
            items={customers}
            isPending={isPending}
            error={error}
            showCount
            keyOf={(c) => c.id}
            createLabel={t("button.create")}
            onCreate={() => modal.open()}
            renderItem={(customer) => (
                <CustomerListItem customer={customer}/>
            )}
        >
            {modal.isOpen && (
                <CustomerModal key={modal.key} onClose={modal.close}/>
            )}
        </ListPage>
    );
}
