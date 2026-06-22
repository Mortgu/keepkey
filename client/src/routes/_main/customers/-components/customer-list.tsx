import {Plus} from "lucide-react";

import {useTranslation} from "react-i18next";
import CustomerListItem from "./customer-list-item";
import CustomerModal from "./customer-modal";

import type {Customer} from "@/types";
import {useCustomerHook, useModal} from "@/hooks";
import {Button} from "@/components";

export default function CustomerList() {
    const {t} = useTranslation();

    const modal = useModal();
    const {customers} = useCustomerHook();

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-medium flex items-center justify-center gap-4">
                    {t("section.customers")} ({customers.length})
                </h1>

                <Button size="sm" icon={<Plus className="size-4"/>} onClick={() => modal.open()}>
                    {t("button.create")}
                </Button>
            </div>

            <div className="grid gap-2">
                {customers.map((customer: Customer, index: number) => (
                    <CustomerListItem key={index} customer={customer}/>
                ))}
            </div>

            {modal.isOpen && (
                <CustomerModal key={modal.key} onClose={modal.close}/>
            )}
        </div>
    );
}
