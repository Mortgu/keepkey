import Button from "@/components/button/button";
import type { Customer } from "@/data/types";
import { formatDate } from "@/lib/format";
import { useCustomers } from "@/hooks/customer";
import { Loader, Pen, Trash } from "lucide-react";
import React, { useState } from "react";
import CustomerModal from "./customer-modal";

interface CustomerListItemProps {
    customer: Customer;
}

export default function CustomerListItem({ customer }: CustomerListItemProps) {
    const [isOpen, setOpen] = useState<boolean>(false);

    const { deleteCustomer, isDeleting } = useCustomers();

    return (
        <React.Fragment>
            <div className='flex items-center justify-between gap-3 border border-gray-300 p-2 rounded-md'>
                <div className="grid gap-0">
                    <h1 className='text-md'>{customer.name}</h1>
                    <p className='text-sm text-gray-500'>{customer.customerId} · {formatDate(customer.createdAt)}</p>
                </div>

                <div className="flex items-center gap-12">
                    <p className="text-sm text-gray-500">{customer.orders?.length ?? 0} Bestellungen</p>

                    <div className="flex items-center">
                        <Button onClick={() => setOpen(true)} size='sm' variant="ghost" icon={<Pen className="size-4" />} iconOnly />
                        <Button
                            onClick={() => deleteCustomer({ id: customer.id })}
                            size='sm'
                            variant="ghost"
                            icon={isDeleting ? <Loader className="size-4 animate-spin" /> : <Trash className="size-4" />}
                            iconOnly
                        />
                    </div>
                </div>
            </div>

            <CustomerModal currentCustomer={customer} isOpen={isOpen} onClose={() => setOpen(false)} />
        </React.Fragment>
    );
}
