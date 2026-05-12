import React, { useState } from "react";
import { Pen, Trash } from "lucide-react";
import CustomerModal from "./customer-modal";

import { formatDate } from "@/lib/format";

import type { Customer } from "@/types";
import { useCustomerHook } from "@/hooks";
import { Button } from "@/components";

interface CustomerListItemProps {
  customer: Customer;
}

export default function CustomerListItem({ customer }: CustomerListItemProps) {
  const [isOpen, setOpen] = useState<boolean>(false);

  const { deleteCustomer, isDeleting } = useCustomerHook();

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
            <Button variant="ghost" size="sm" icon={<Pen className="size-4" />}
              iconOnly onClick={() => setOpen(true)} />
            <Button variant="ghost" size="sm" loading={isDeleting}
              icon={<Trash className="size-4" />} iconOnly
              onClick={() => deleteCustomer({ id: customer.id })} />
          </div>
        </div>
      </div>

      <CustomerModal currentCustomer={customer} open={isOpen} cancelFn={() => setOpen(false)} />
    </React.Fragment>
  );
}
