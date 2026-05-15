import React, { useEffect, useState } from "react";
import { Pen, Trash, User, Users } from "lucide-react";
import CustomerModal from "./customer-modal";

import { formatDate } from "@/lib/format";

import type { Customer } from "@/types";
import { useCustomerHook } from "@/hooks";
import { Button } from "@/components";
import ContactPersonModal from "./contact-person-modal";
import { ToastContainer, toast } from 'react-toastify';

interface CustomerListItemProps {
  customer: Customer;
}

export default function CustomerListItem({ customer }: CustomerListItemProps) {
  const [edit, setEdit] = useState<boolean>(false);
  const [adding, setAdding] = useState<boolean>(false);

  const { deleteCustomer, isDeleting, errorDeleting } = useCustomerHook();

  if (errorDeleting) {
  }

  useEffect(() => {
    toast.error(errorDeleting?.message)
  }, [errorDeleting]);

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

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<Pen className="size-3.5" />}
              iconOnly onClick={() => setEdit(true)} />

            <Button variant="secondary" size="sm" icon={<Users className="size-3.5" />}
              iconOnly onClick={() => setAdding(true)} />

            <Button variant="secondary" size="sm" loading={isDeleting}
              icon={<Trash className="size-3.5" />} iconOnly
              onClick={() => deleteCustomer({ id: customer.id })} />
          </div>
        </div>
      </div>

      <CustomerModal currentCustomer={customer} open={edit} cancelFn={() => setEdit(false)} />
      <ContactPersonModal open={adding} cancelFn={() => setAdding(false)}
        currentCustomerId={customer.id} currentContactPersons={customer.contactPersons ?? []} />
    </React.Fragment>
  );
}
