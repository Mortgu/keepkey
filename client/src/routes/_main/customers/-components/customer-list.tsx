import { Plus } from "lucide-react";

import CustomerListItem from "./customer-list-item";
import CustomerModal from "./customer-modal";

import { useCustomerHook, useModal } from "@/hooks";
import type { Customer } from "@/types";
import { Button } from "@/components";

export default function CustomerList() {
  const modal = useModal();

  const { customers } = useCustomerHook();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-medium flex items-center justify-center gap-4">
          Kunden ({customers.length})
        </h1>

        <Button size="sm" icon={<Plus className="size-4" />} onClick={() => modal.open()}>
          Kunde hinzufügen
        </Button>
      </div>

      <div className="grid gap-2">
        {customers.map((customer: Customer, index: number) => (
          <CustomerListItem key={index} customer={customer} />
        ))}
      </div>

      {modal.isOpen && (
        <CustomerModal key={modal.key} onClose={modal.close} />
      )}
    </div>
  );
}
