import Button from "@/components/button/button";
import type { Customer } from "@/types";
import { formatDate } from "@/lib/format";
import { useCustomers } from "@/hooks/customer";
import { Pen, Trash } from "lucide-react";
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
      <div className="flex items-center justify-between px-4 py-3 border border-(--border) rounded-md">
        <div className="grid gap-0">
          <h1 className="text-md">{customer.companyName}</h1>
          <p className="text-sm text-gray-500">
            {customer.customerId} · {formatDate(customer.createdAt || "")}
          </p>
        </div>

        <div className="flex items-center gap-12">
          <p className="text-sm text-gray-500">
            {customer.orders?.length ?? 0} Bestellungen
          </p>

          <div className="flex items-center">
            <Button
              onClick={() => setOpen(true)}
              size="sm"
              variant="ghost"
              icon={<Pen className="size-4" />}
              iconOnly
            />
            <Button
              onClick={() => deleteCustomer({ id: customer.id })}
              size="sm"
              variant="ghost"
              loading={isDeleting}
              icon={<Trash className="size-4" />}
              iconOnly
            />
          </div>
        </div>
      </div>

      <CustomerModal
        currentCustomer={customer}
        open={isOpen}
        cancelFn={() => setOpen(false)}
      />
    </React.Fragment>
  );
}
