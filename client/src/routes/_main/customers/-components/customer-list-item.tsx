import React, { useEffect } from "react";
import { Pen, Trash, Users } from "lucide-react";
import CustomerModal from "./customer-modal";

import { formatDate } from "@/lib/format";

import type { Customer } from "@/types";
import { useCustomerHook, useModal } from "@/hooks";
import { Button } from "@/components";
import ContactPersonModal from "./contact-person-modal";
import { ToastContainer, toast } from 'react-toastify';

interface CustomerListItemProps {
  customer: Customer;
}

export default function CustomerListItem({ customer }: CustomerListItemProps) {
  const editModal = useModal<Customer>();
  const contactModal = useModal();

  const { deleteCustomer, isDeleting, errorDeleting } = useCustomerHook();

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
              iconOnly onClick={() => editModal.open(customer)} />

            <Button variant="secondary" size="sm" icon={<Users className="size-3.5" />}
              iconOnly onClick={() => contactModal.open()} />

            <Button variant="secondary" size="sm" loading={isDeleting}
              icon={<Trash className="size-3.5" />} iconOnly
              onClick={() => deleteCustomer({ id: customer.id })} />
          </div>
        </div>
      </div>

      {editModal.isOpen && (
        <CustomerModal key={editModal.key} currentCustomer={editModal.data} onClose={editModal.close} />
      )}

      {contactModal.isOpen && (
        <ContactPersonModal key={contactModal.key} onClose={contactModal.close}
          currentCustomerId={customer.id} currentContactPersons={customer.contactPersons ?? []} />
      )}
    </React.Fragment>
  );
}
