import Button from "@/components/button/button";
import type { Customer } from "@/data/types";
import { useCustomers } from "@/hooks/customer";
import { Plus } from "lucide-react";
import { useState } from "react";
import CustomerListItem from "./customer-list-item";
import CustomerModal from "./customer-modal";

export default function CustomerList() {
    const [isOpen, setOpen] = useState<boolean>(false);

    const { customers } = useCustomers();

    return (
        <div>
            <div className='mb-4 flex items-center justify-between'>
                <h1 className='text-2xl font-medium flex items-center justify-center gap-4'>
                    Kunden ({customers.length})
                </h1>

                <Button onClick={() => setOpen(true)} size="sm" icon={<Plus className="size-4" />}>
                    Kunde hinzufügen
                </Button>
            </div>

            <div className='grid gap-2'>
                {customers.map((customer: Customer, index: number) => (
                    <CustomerListItem key={index} customer={customer} />
                ))}
            </div>

            <CustomerModal open={isOpen} cancelFn={() => setOpen(false)} />
        </div>
    );
}
