import CustomerListItem from "./customer-list-item";
import CustomerModal from "./customer-modal";

import { ListSkeleton, PageWidth, RouteError, Skeleton } from "@/components";
import { useCustomers, useModal } from "@/hooks";
import { Fragment } from "react";


export default function CustomerList() {
    const modal = useModal();

    const { customers, isPending, error } = useCustomers();

    return (
        <PageWidth variant="full">
            {isPending && (
                <ListSkeleton
                    rows={6}
                    skeleton={<Skeleton shape="rect" />}
                />
            )}

            {error && (
                <RouteError error={error} />
            )}

            {(customers.length === 0) && (
                <p className="text-sm text-(--text-secondary) py-8 text-center">

                </p>
            )}


            <div className="grid gap-2">
                {customers.map((item, index) => (
                    <Fragment key={item.id}>
                        <CustomerListItem customer={item} />
                    </Fragment>
                ))}
            </div>

            {modal.isOpen && (
                <CustomerModal key={modal.key} onClose={modal.close} />
            )}
        </PageWidth>
    );
}
